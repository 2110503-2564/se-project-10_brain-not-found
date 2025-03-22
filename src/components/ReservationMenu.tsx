import style from './ReservationMenu.module.css'

export default function ReservationMenu(){
    return (
        <div className="w-[250px] border border-silver rounded-lg p-2 m-1 flex flex-col">
            <h2>Shiba777</h2>
            <ul>
                <li>ข้าวเหนียว: $5</li>
                <li>หมูปิ้ง: $10</li>
                <li>ตับไก่: $10</li>
                <li>ปลาดุกย่าง: $40</li>
                <li>มะละกอตำ: $20</li>
            </ul>
        </div>
    )
}