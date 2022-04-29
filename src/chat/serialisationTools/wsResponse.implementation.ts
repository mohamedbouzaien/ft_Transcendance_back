import { WsResponse } from "@nestjs/websockets";

export class WsResponseImplementation<T> implements WsResponse {
  event: any;
  data: any;

  constructor(event: any, data: T) {
    this.event = event;
    this.data = data;
  }
}