

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
    reservations:Array<BookingItem>,
    timeSlot:Array<String>,
    id: string
  }
  
 interface ShopJson {
    success: boolean,
    count: number,
    // pagination: Object,
    data: ShopItem[]
  }

 interface BookingItem {
    reservationDate: string,
    timeReceiveService: string,
    userId: string,
    shopName: string,
    shopId: string,
    createAt: string,
  }