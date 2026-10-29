import {afterEach,expect,it,vi} from "vitest";
import {render,screen,fireEvent,cleanup} from "@testing-library/react";
import {ProductReviews} from "@/components/product/ProductReviews";
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it("submits a review for approval without adding it to the public list",async()=>{
 const fetch=vi.fn().mockResolvedValueOnce({ok:true,json:async()=>({reviews:[]})}).mockResolvedValueOnce({ok:true,json:async()=>({message:"Thank you. Your review will appear after approval."})});
 vi.stubGlobal("fetch",fetch);
 render(<ProductReviews productId="p1"/>);
 await screen.findByText("No approved reviews yet. Share your experience below.");
 fireEvent.change(screen.getByLabelText("Your name"),{target:{value:"Buyer"}});
 fireEvent.change(screen.getByLabelText("Rating"),{target:{value:"5"}});
 fireEvent.change(screen.getByLabelText("Your review"),{target:{value:"Wonderful ghee, thanks!"}});
 fireEvent.submit(screen.getByRole("button",{name:"Submit review"}).closest("form")!);
 await screen.findByText("Thank you. Your review will appear after approval.");
 expect(JSON.parse(fetch.mock.calls[1]![1].body)).toMatchObject({productId:"p1",rating:5,name:"Buyer",body:"Wonderful ghee, thanks!"});
 expect(screen.queryByText("Wonderful ghee, thanks!")).toBeNull();
});
it("renders approved text as text, never executable HTML",async()=>{
 vi.stubGlobal("fetch",vi.fn().mockResolvedValue({ok:true,json:async()=>({reviews:[{id:"r1",author_name:"Buyer",rating:4,body:"<script>alert(1)</script>"}]})}));
 const {container}=render(<ProductReviews productId="p1"/>);
 await screen.findByText("<script>alert(1)</script>");
 expect(container.querySelector("script")).toBeNull();
 expect(screen.getByLabelText("4 out of 5 stars")).toBeInTheDocument();
});
