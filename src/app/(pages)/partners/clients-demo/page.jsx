import ClientDetails from "@/components/client-details";
import ClientLists from "@/components/client-lists";

export default function ClientsDemo() {

    return(
        <>
      

        <div className="flex gap-5">
        <ClientLists/>
        <ClientDetails/>
        </div>
        </>
    )

}