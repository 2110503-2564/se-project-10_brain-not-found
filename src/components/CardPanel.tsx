'use client'
import Card from "./Card";
import { useReducer, useRef , useEffect, useState}  from "react";
import Link from "next/link";
import getShops from '@/libs/getShops'

export default function CardPanel(){

    const [CardResponse, setCardResponse] = useState<ShopJson | null>(null);

    useEffect(()=>{
        const fetchData = async ()=>{
            const response = await getShops();
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
    

    const defaultShop = new Map([
        ['The Bloom Pavilion', 0],
        ['Spark Space', 0],
        ['The Grand Table', 0],
      ]);

    const compareReducer = (ShopList:Map<string , number>, action:{type:string, ShopName:string , rating?:number} )=>{
        switch(action.type){
            case "add":{
                const newShopList = new Map(ShopList);
                newShopList.set(action.ShopName , action.rating??0);   //if rating is null . then reset to 0 !!!!!!!!!!
                return newShopList;
            }
            case "remove":{
                const newShopList = new Map(ShopList);
                newShopList.delete(action.ShopName);
                return newShopList;
            }
            default:{
                return ShopList;
            }
        }
    }

    const [ShopList, dispatchCompare] = useReducer(compareReducer, new Map(defaultShop));

    const countRef = useRef(0);
    const inputRef = useRef<HTMLInputElement>(null);

    if(!CardResponse) return(<p>Loading... . . . . .</p>)

    return (
         <div>
                <div className="m-5 flex flex-row content-around justify-around flex-wrap">
                    {
                        CardResponse.data.map((cardItem:ShopItem)=>
                        <Link href={`/Shop/${cardItem.id}`} className="w-1/5" key={cardItem.id}>
                        <Card shopName={cardItem.name} imgSrc={cardItem.picture} desc={cardItem.desc}
                            onCompare={(Shop:string ,rating:number|undefined)=>
                                dispatchCompare({type:"add", ShopName:Shop , rating})}
                        />
                        </Link>
                        )
                    }

                </div>
                <div className="w-full text-xl font-medium text-center mt-4">
                    Shop List with Ratings: {ShopList.size} 
                        { Array.from(ShopList).map( ([ShopName , rating]) => 
                        <div data-testid={ShopName} key={ShopName} onClick={()=>dispatchCompare({type:"remove", ShopName:ShopName})} > 
                            {ShopName} : {rating} 
                        </div>  ) }
                </div>

                <button className="block bg-blue-500 text-white rounded-md px-8 py-3 hover:bg-blue-600 shadow-2xl"
                name="Book Shop"
                onClick={()=>countRef.current++}>
                click me
                </button>
                {countRef.current}

                <input type="text" placeholder="Please fill some things" className="block text-gray-900 text-sm rounded-ls
                p-2 m-2 bg-purple-50 ring-1 ring-inset ring-purple-400
                focus:outline-none focus:bg-purple-200 focus:ring-2"
                ref={inputRef}/>

                <button className="block bg-blue-500 text-white rounded-md px-8 py-3 hover:bg-blue-600 shadow-2xl"
                name="Book Shop"
                onClick={()=>{ inputRef.current?.focus();}}>
                Focus Input
                </button>
         </div>
    )
}
