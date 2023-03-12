// To parse this data:
//
//   import { Convert, OptionChain } from "./file";
//
//   const optionChain = Convert.toOptionChain(json);

export interface OptionChain {
  result: number;
  resultMessage: string;
  resultData: ResultData;
}

export interface ResultData {
  opExpiryDates: Date[];
  opDatas: OpData[];
  ddldata: Ddldata;
}

export interface Ddldata {
  oi: number[];
  volume: number[];
  proximity: number[];
}

export interface OpData {
  calls_oi: number;
  calls_change_oi: number;
  calls_volume: number;
  calls_iv: number;
  calls_ltp: number;
  calls_net_change: number;
  calls_bid_price: number;
  calls_ask_price: number;
  strike_price: number;
  puts_oi: number;
  puts_change_oi: number;
  puts_volume: number;
  puts_iv: number;
  puts_ltp: number;
  puts_net_change: number;
  puts_ask_price: number;
  puts_bid_price: number;
  expiry_date: Date;
  time: string;
  index_close: number;
  created_at: Date;
  call_high: number;
  call_low: number;
  call_open: number;
  put_high: number;
  put_low: number;
  put_open: number;
  call_delta: number;
  call_gamma: number;
  call_vega: number;
  call_theta: number;
  call_rho: number;
  put_delta: number;
  put_gamma: number;
  put_vega: number;
  put_theta: number;
  put_rho: number;
  calls_oi_value: number;
  puts_oi_value: number;
  calls_change_oi_value: number;
  puts_change_oi_value: number;
  calls_offer_price: number;
  puts_offer_price: number;
  calls_average_price: number;
  puts_average_price: number;
  previous_eod_calls_oi: number;
  previous_eod_puts_oi: number;
  calls_builtup: CallsBuiltup;
  puts_builtup: PutsBuiltup;
}

export enum CallsBuiltup {
  CallLongCovering = 'Call Long Covering',
  CallWriting = 'Call Writing',
  NoConclusion = 'No Conclusion',
}

export enum PutsBuiltup {
  NoConclusion = 'No Conclusion',
  PutBuying = 'Put Buying',
  PutShortCovering = 'Put Short Covering',
  PutWriting = 'Put Writing',
}

// Converts JSON strings to/from your types
export class Convert {
  public static toOptionChain(json: string): OptionChain {
    return JSON.parse(json);
  }

  public static optionChainToJson(value: OptionChain): string {
    return JSON.stringify(value);
  }
}
