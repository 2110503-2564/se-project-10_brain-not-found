

 interface ShopItem {
    _id: string,
    name: string,
    address: string,
    district: string,
    province: string,
    postalcode: string,
    tel: string,
    picture: string,
    region:string,
    openTime:string,
    closeTime:string,
    __v: number,
    reservations:Array<Reservationbody>,
    id: string
  }
  
 interface ShopJson {
    success: boolean,
    count: number,
    // pagination: Object,
    data: ShopItem[]
  }

  interface Reservationbody{
    reservationDate: Date,
    user: string,
    shop: string,
  }
  
 interface ReservaionJson {
    success: boolean,
    count: number,
    from: string,
    data: ShopItem[]
  }

  interface ReservationItem{
    _id: string,
    reservationDate: Date,
    user: string,
    shop:ShopItem,
    createAt: Date,
    id: string
  }