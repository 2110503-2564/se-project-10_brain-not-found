'use client'
import Card from "./Card";
import { useReducer, useRef , useEffect, useState}  from "react";
import Link from "next/link";
import getVenues from '@/libs/getVenues'

export default function CardPanel(){

    const [CardResponse, setCardResponse] = useState<VenueJson | null>(null);

    useEffect(()=>{
        const fetchData = async ()=>{
            const response = await getVenues();
            setCardResponse(response);
            }
            fetchData();
        
        },[]);
    
    // Mock Data for Demontration Only
    // const mockCardRepo = [
    //     {vid: "001" , name:"The Bloom Pavilion" , image:"/img/bloom.jpg"},
    //     {vid: "002" , name:"Spark Space" , image:"/img/sparkspace.jpg"},
    //     {vid: "003" , name:"The Grand Table" , image:"/img/grandtable.jpg"},
    // ]
    

    const defaultVenue = new Map([
        ['The Bloom Pavilion', 0],
        ['Spark Space', 0],
        ['The Grand Table', 0],
      ]);

    const compareReducer = (venueList:Map<string , number>, action:{type:string, venueName:string , rating?:number} )=>{
        switch(action.type){
            case "add":{
                const newValueList = new Map(venueList);
                newValueList.set(action.venueName , action.rating??0);   //if rating is null . then reset to 0 !!!!!!!!!!
                return newValueList;
            }
            case "remove":{
                const newValueList = new Map(venueList);
                newValueList.delete(action.venueName);
                return newValueList;
            }
            default:{
                return venueList;
            }
        }
    }

    const [venueList, dispatchCompare] = useReducer(compareReducer, new Map(defaultVenue));

    const countRef = useRef(0);
    const inputRef = useRef<HTMLInputElement>(null);

    if(!CardResponse) return(<p>Loading... . . . . .</p>)

    return (
         <div>
                <div className="m-5 flex flex-row content-around justify-around flex-wrap">
                    {
                        CardResponse.data.map((cardItem:VenueItem)=>
                        <Link href={`/venue/${cardItem.id}`} className="w-1/5" key={cardItem.id}>
                        <Card venueName={cardItem.name} imgSrc={cardItem.picture}
                            onCompare={(venue:string ,rating:number|undefined)=>
                                dispatchCompare({type:"add", venueName:venue , rating})}
                        />
                        </Link>
                        )
                    }

                </div>
                <div className="w-full text-xl font-medium text-center mt-4">
                    Venue List with Ratings: {venueList.size} 
                        { Array.from(venueList).map( ([venueName , rating]) => 
                        <div data-testid={venueName} key={venueName} onClick={()=>dispatchCompare({type:"remove", venueName:venueName})} > 
                            {venueName} : {rating} 
                        </div>  ) }
                </div>

                <button className="block bg-blue-500 text-white rounded-md px-8 py-3 hover:bg-blue-600 shadow-2xl"
                name="Book Venue"
                onClick={()=>countRef.current++}>
                click me
                </button>
                {countRef.current}

                <input type="text" placeholder="Please fill some things" className="block text-gray-900 text-sm rounded-ls
                p-2 m-2 bg-purple-50 ring-1 ring-inset ring-purple-400
                focus:outline-none focus:bg-purple-200 focus:ring-2"
                ref={inputRef}/>

                <button className="block bg-blue-500 text-white rounded-md px-8 py-3 hover:bg-blue-600 shadow-2xl"
                name="Book Venue"
                onClick={()=>{ inputRef.current?.focus();}}>
                Focus Input
                </button>
         </div>
    )
}
