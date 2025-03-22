 interface VenueItem {
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
    id: string
  }
  
 interface VenueJson {
    success: boolean,
    count: number,
    // pagination: Object,
    data: VenueItem[]
  }

 interface BookingItem {
    reservationDate: string,
    userId: string,
    shopName: string,
    shopId: string,
    createAt: string,
  }