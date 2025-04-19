 interface Review { // subject to changes
  _id: string,
  header: string,
  comment: string,
  rating: number,
  shop: string,
  user: {
    name: string
    _id: string,
    email: string
  },
  createdAt: Date,
  edited?: Date
 }

 interface ReviewJson {
  success: boolean,
  count: number,
  pagination: Pagination
  data: Review[]
 }

 interface Pagination {
  next?: {page: number, limit: number},
  prev?: {page: number, limit: number}
 }

 interface ErrorJSON {
  success: boolean,
  message: string
 }

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
    reservations?: Array<Reservationbody>,
    reviews?: Review[],
    reviewCount?: number,
    averageRating?: number,
    desc: string,
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
    userName: string
  }
  
 interface ReservaionJson {
    success: boolean,
    count: number,
    from: string,
    data: ReservationItem[]
  }

  interface ReservationItem{
    _id: string,
    reservationDate: Date,
    userName: string,
    user: string,
    shop: ShopItem,
    createAt: Date,
  }