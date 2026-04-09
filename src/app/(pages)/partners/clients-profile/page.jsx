import { Suspense } from 'react';
import ClientDetails from "@/components/client-details";
import ClientLists from "@/components/client-lists";

export default function ClientsProfile() {

    return(
        <>
      

        <Suspense fallback={<div>Loading...</div>}>
            <div className="flex gap-5">
                <ClientLists/>
                <ClientDetails/>
            </div>
        </Suspense>
        </>
    )

}