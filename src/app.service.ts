import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { request } from 'undici';
import { OpData, OptionChain } from './interfaces/optionchain.type';

@Injectable()
export class AppService {
  getInstrument(instrument: string) {
    return `https://h9cg992bof.execute-api.ap-south-1.amazonaws.com/webapi/option/fatch-option-chain?symbol=${instrument}&expiryDate=`;
  }

  async getAtmStrike(instrument: string) {
    const { body } = await request(
      `https://h9cg992bof.execute-api.ap-south-1.amazonaws.com/webapi/symbol/today-spot-data?symbol=${instrument}`,
    );

    const response = await body.json();

    console.log(response.resultData.last_trade_price);

    return response.resultData.last_trade_price;
  }

  async fetchOptionChain(): Promise<any> {
    // Request data
    const { body } = await request(this.getInstrument('banknifty'));

    const jsonConverted: OptionChain = await body.json();

    return jsonConverted;
  }

  async getSentimentAnalysis(instrument: string): Promise<any> {
    if (instrument == null) {
      throw new HttpException(
        'Instrument is required. Pass either [nifty, banknifty]',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Request data
    const { body } = await request(
      `https://h9cg992bof.execute-api.ap-south-1.amazonaws.com/webapi/option/fatch-option-chain?symbol=${instrument}&expiryDate=`,
      {
        method: 'GET',
      },
    );

    const optionChain = await body.json();

    let atmParam;

    if (instrument == 'nifty') {
      atmParam = 'NIFTY';
    }

    if (instrument == 'banknifty') {
      atmParam = 'NIFTY+BANK';
    }

    const atm = await this.getAtmStrike(atmParam);

    const atmStrike = Math.ceil(atm / 100) * 100;

    const limitStrike = 10;

    // Greeks value on day opening

    // TODO: Automatic fetch initial vega and delta on day opening and console.log the strikes.
    // Get opening day option chain
    // Get current expiry week strike prices
    const currentWeek = optionChain.resultData;

    // Get atm strike data
    const currStrikeIndex = currentWeek.opDatas.findIndex(
      (s) => s.strike_price == atmStrike,
    );

    // Get opening day atm strike data
    const openingDayGreeks = {};

    // TODO: Run this only one time at 9:15 AM.
    for (
      let i = currStrikeIndex - limitStrike;
      i <= currStrikeIndex + limitStrike;
      i++
    ) {
      const option: OpData = currentWeek.opDatas[i];

      const strike = option.strike_price;

      openingDayGreeks[strike] = {
        call: {
          vega: option.call_vega,
          delta: option.call_delta,
        },
        put: {
          vega: option.put_vega,
          delta: option.put_delta,
        },
      };
    }

    // Get atm strike data
    const startIndex = currentWeek.opDatas.findIndex(
      (s) => s.strike_price == atmStrike,
    );

    const changeInGreeks = {};

    let totalChangeInCallVega = 0;
    let totalChangeInCallDelta = 0;

    let totalChangeInPutVega = 0;
    let totalChangeInPutDelta = 0;

    // Call greeks change
    for (let i = startIndex; i < startIndex + limitStrike; i++) {
      const option: OpData = currentWeek.opDatas[i];

      // console.log('CALL strike', option.strike_price);

      // Get the strike price from day opening greeks and subtract the difference
      changeInGreeks[option.strike_price] = {
        vega: parseFloat(
          (
            openingDayGreeks[option.strike_price].call.vega - option.call_vega
          ).toFixed(2),
        ),
        delta: parseFloat(
          (
            openingDayGreeks[option.strike_price].call.delta - option.call_vega
          ).toFixed(2),
        ),
      };

      totalChangeInCallVega += changeInGreeks[option.strike_price].vega;
      totalChangeInCallDelta += changeInGreeks[option.strike_price].delta;
    }

    // Put Greeks change
    for (let i = startIndex; i > startIndex - limitStrike; i--) {
      const option: OpData = currentWeek.opDatas[i];

      // console.log('PUT strike', option.strike_price);

      // Get the strike price from day opening greeks and subtract the difference
      changeInGreeks[option.strike_price] = {
        vega: parseFloat(
          (
            openingDayGreeks[option.strike_price].put.vega - option.put_vega
          ).toFixed(2),
        ),
        delta: parseFloat(
          (
            openingDayGreeks[option.strike_price].put.delta - option.put_delta
          ).toFixed(2),
        ),
      };

      totalChangeInPutVega += changeInGreeks[option.strike_price].vega;
      totalChangeInPutDelta += changeInGreeks[option.strike_price].delta;
    }

    let marketDirection;

    if (totalChangeInCallVega > 0 && totalChangeInPutVega < 0) {
      marketDirection = 'BEARISH';
    } else {
      console.log('Bull');
      marketDirection = 'BULLISH';
    }

    return {
      instrument,
      atmStrike,
      marketDirection,
      call: {
        vega: totalChangeInCallDelta,
        delta: totalChangeInCallVega,
      },
      put: {
        vega: totalChangeInPutVega,
        delta: totalChangeInPutDelta,
      },
    };
  }
}
