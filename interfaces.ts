 interface Review { 
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

interface Request {
  _id: string,
  user: string,
  createdAt: Date,
  shop: ShopItem,
  status: string,
  requestType: string,
  edited?: Date,
  reason?: string
}

interface Service {
  name: string,
  desc: string,
  duration: number,
  price: number
}

interface SingleShopItem {
  success: boolean;
  data: ShopItem;
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
    picture: string[],
    region:string,
    openTime:string,
    closeTime:string,
    __v: number,
    reservations?: Array<Reservationbody>,
    reviews?: Review[],
    reviewCount?: number,
    averageRating?: number,
    desc: string,
    id: string,
    services?: [Service]
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

  interface RequestItem { 
  _id: string,
  shop: ShopItemForRequest,
  user: User,     //user ID
  createdAt: Date,
  reason: string | "",
  status: string,
  requestType: string,
}
interface RequestItemToCreateShop { 
  shop: ShopItemForRequest,
  user: User,     //user ID
  requestType: string,
}

interface ShopItemForRequest {
  name: string,
  address: string,
  district: string,
  province: string,
  postalcode: string,
  tel: string,
  picture: string[],
  region:string,
  openTime:string,
  closeTime:string,
  desc: string,
  shopType:string,
  services?:ServiceBase[],
  certificate?:string
}
interface ServiceBase {
  name: string;
  desc: string;
  price: string;
  duration: string;
}
interface Service extends ServiceBase {
  id: string; // ใช้ ID ชั่วคราวจาก crypto.randomUUID()
}

interface User {
  _id: string,
  name: string,
  // email: string,
  // role: string
}