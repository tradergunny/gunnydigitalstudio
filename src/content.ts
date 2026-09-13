import type { ObjectId } from './state';
export interface Item {id:ObjectId; number:string; name:string; subtitle:string; detail:string; tag:string; position:[number,number,number];}
export const items:Item[]=[
  {id:'workstation',number:'01',name:'The workstation',subtitle:'พื้นที่สำหรับสร้างสิ่งใหม่',detail:'จอหลักสำหรับติดตามข้อมูล คู่กับจอแนวตั้งสำหรับเขียนโค้ด คลิกปุ่มด้านล่างเพื่อเปิดหรือพักหน้าจอทั้งสองพร้อมกัน',tag:'DUAL DISPLAY',position:[-1.05,2.22,-2.27]},
  {id:'lamp',number:'02',name:'A little atmosphere',subtitle:'แสงที่เข้ากับจังหวะของคุณ',detail:'เปิดโคมไฟทำงาน หรือจัดบรรยากาศทั้งห้องด้วยโหมดแสงในแถบด้านล่าง แสงจะเปลี่ยนบนโมเดลแบบเรียลไทม์',tag:'TASK LIGHT',position:[-2.48,2.23,-1.66]},
  {id:'pc',number:'03',name:'The powerhouse',subtitle:'เบื้องหลังทุกไอเดีย',detail:'เวิร์กสเตชันพร้อมไฟวงแหวนสีไอซ์บลู ลองเปิด–ปิดเครื่องเพื่อดูไฟสถานะและพัดลมเปลี่ยนตาม',tag:'WORKSTATION PC',position:[1.05,.90,-1.62]},
  {id:'server',number:'04',name:'The home lab',subtitle:'มุมทดลองของคนไอที',detail:'ตู้โฮมแล็บขนาดกะทัดรัดสำหรับระบบเครือข่ายและเซิร์ฟเวอร์จำลอง สวิตช์นี้ควบคุมไฟสถานะของโมเดล ไม่ได้เชื่อมต่ออุปกรณ์จริง',tag:'LOCAL SIMULATION',position:[2.04,.92,.31]},
  {id:'chair',number:'05',name:'Make yourself at home',subtitle:'พัก แล้วค่อยเริ่มใหม่',detail:'เก้าอี้พร้อมพนักศีรษะหนังและฐานโลหะ ลองหมุนเก้าอี้เพื่อสำรวจรูปทรง หรือใช้ปุ่มโฟกัสเพื่อดูใกล้ขึ้น',tag:'ERGONOMIC SEATING',position:[-.89,1.54,.20]},
  {id:'blind',number:'06',name:'Let the light in',subtitle:'คุมแสงธรรมชาติ',detail:'ปรับระดับม่านม้วนได้ตามต้องการ บานม่านและคานล่างเคลื่อนที่พร้อมกัน และแสงจากหน้าต่างเปลี่ยนตามระดับที่เปิด',tag:'ROLLER BLIND',position:[2.85,2.94,-1.2]},
  {id:'drawer',number:'07',name:'Everything in its place',subtitle:'เก็บรายละเอียดให้เรียบร้อย',detail:'ลิ้นชักบนของโต๊ะวอลนัตเลื่อนเปิด–ปิดได้ เพื่อให้พื้นที่ทำงานดูสงบและเป็นระเบียบ',tag:'CONCEALED STORAGE',position:[-2.22,1.03,-1.50]},
  {id:'laptop',number:'08',name:'Ready to go',subtitle:'งานต่อเนื่องจากทุกที่',detail:'โน้ตบุ๊กพร้อมด็อกบนโต๊ะทำงาน เปิดหน้าจอเพื่อแสดงเทอร์มินัล หรือพักหน้าจอเมื่อไม่ได้ใช้งาน',tag:'DOCKED NOTEBOOK',position:[.71,1.72,-1.77]},
  {id:'speakers',number:'09',name:'Set the rhythm',subtitle:'เติมเสียงเบา ๆ ให้ห้อง',detail:'ลองฟังซาวด์แอมเบียนต์ที่สร้างในเบราว์เซอร์ เสียงจะเริ่มเมื่อคุณกดเล่นเท่านั้น และปรับระดับได้จากตรงนี้',tag:'STUDIO AUDIO',position:[-2.38,1.77,-2.10]},
  {id:'headphones',number:'10',name:'In your own world',subtitle:'ช่วงเวลาที่ต้องการสมาธิ',detail:'หูฟังบนแท่นโลหะ สำหรับช่วงเวลาที่ต้องการตัดสิ่งรบกวน เลือกโหมดโฟกัสเพื่อเปลี่ยนห้องเป็นบรรยากาศทำงานยามค่ำ',tag:'FOCUS CORNER',position:[2.43,1.64,.865]},
  {id:'camera',number:'11',name:'A different perspective',subtitle:'สร้างสรรค์นอกหน้าจอ',detail:'กล้องและเลนส์ในตู้กระจก เพิ่มพื้นที่ให้การถ่ายภาพและงานสร้างสรรค์ ลองบันทึกภาพมุมปัจจุบันของห้องเป็นไฟล์ PNG',tag:'CREATOR COLLECTION',position:[2.35,1.48,2.08]},
];
export const byId=Object.fromEntries(items.map(i=>[i.id,i])) as Record<ObjectId,Item>;
