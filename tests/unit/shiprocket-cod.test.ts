// @vitest-environment node
import { expect,it,vi } from "vitest";
import type { Order } from "@/types";
vi.mock("@/lib/validation/env",()=>({USE_MOCK_DATA:false,optionalServerEnv:()=>"test-value"}));
import {createShipment} from "@/lib/shiprocket/server";
it("sends shipping and COD charges separately for the courier collection total",async()=>{
 const fetch=vi.fn().mockResolvedValueOnce({ok:true,json:async()=>({token:"test-token"})}).mockResolvedValueOnce({ok:true,json:async()=>({shipment_id:1})});
 vi.stubGlobal("fetch",fetch);
 try {
  await createShipment({orderNumber:"TEST",createdAt:"2026-10-22",address:{},items:[{sku:"VARA-GHEE-1000",productName:"Ghee",size:"1L",quantity:1,unitPrice:400}],subtotal:400,shippingAmount:178,codFee:99,paymentMethod:"cod"} as Order);
  const payload=JSON.parse(fetch.mock.calls[1]![1].body);
  expect(payload).toMatchObject({sub_total:400,shipping_charges:79,transaction_charges:99,payment_method:"COD"});
  expect(payload.sub_total+payload.shipping_charges+payload.transaction_charges).toBe(578);
 } finally {vi.unstubAllGlobals();}
});
