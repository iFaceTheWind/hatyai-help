export type Language = 'en' | 'th';

export const translations = {
  en: {
    app_name: 'Hat Yai Help',
    need_help: 'I Need Help',
    give_help: 'I Can Help',
    map_view: 'Map View',
    list_view: 'List View',
    help_type: {
      water: 'Water',
      food: 'Food',
      medicine: 'Medicine',
      shelter: 'Shelter',
      transport: 'Transport',
      rescue: 'Rescue',
      power: 'Power/Electricity',
    },
    urgency: {
      normal: 'Normal',
      urgent: 'Urgent',
    },
    status: {
      open: 'Open',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      expired: 'Expired',
    },
    form: {
      description: 'Description',
      contact: 'Contact Info (Required)',
      submit: 'Post Request',
      location: 'Location',
      search_address: 'Search Address',
      use_current_location: 'Use My Location',
      location_set: 'Location Set',
      locating: 'Locating...',
      select_on_map: 'Select on Map',
      tap_to_select: 'Tap on map to select location',
      urgency_label: 'Urgency',
      filter_all: 'All',
      filter_urgent: 'Urgent',
    },
    role: {
      need: 'Person in Need',
      volunteer: 'Volunteer',
    },
    auth: {
      login_title: 'Sign In',
      login_desc: 'Sign in to post requests or volunteer.',
      send_link: 'Send Magic Link',
      sign_out: 'Sign Out',
    }
  },
  th: {
    app_name: 'หาดใหญ่ช่วยกัน',
    need_help: 'ต้องการความช่วยเหลือ',
    give_help: 'ฉันสามารถช่วยเหลือได้',
    map_view: 'มุมมองแผนที่',
    list_view: 'มุมมองรายการ',
    help_type: {
      water: 'น้ำดื่ม',
      food: 'อาหาร',
      medicine: 'ยา/เวชภัณฑ์',
      shelter: 'ที่พักพิง',
      transport: 'การเดินทาง',
      rescue: 'กู้ภัย',
      power: 'ไฟฟ้า/ชาร์จแบต',
    },
    urgency: {
      normal: 'ปกติ',
      urgent: 'ด่วน',
    },
    status: {
      open: 'รอความช่วยเหลือ',
      in_progress: 'กำลังช่วยเหลือ',
      resolved: 'ช่วยเหลือแล้ว',
      expired: 'หมดอายุ',
    },
    form: {
      description: 'รายละเอียด',
      contact: 'ข้อมูลติดต่อ (จำเป็น)',
      submit: 'ส่งคำขอ',
      location: 'ตำแหน่ง',
      search_address: 'ค้นหาที่อยู่',
      use_current_location: 'ใช้ตำแหน่งปัจจุบัน',
      location_set: 'ระบุตำแหน่งแล้ว',
      locating: 'กำลังระบุตำแหน่ง...',
      select_on_map: 'เลือกบนแผนที่',
      tap_to_select: 'แตะบนแผนที่เพื่อระบุตำแหน่ง',
      urgency_label: 'ความเร่งด่วน',
      filter_all: 'ทั้งหมด',
      filter_urgent: 'ด่วน',
    },
    role: {
      need: 'ผู้ต้องการความช่วยเหลือ',
      volunteer: 'อาสาสมัคร',
    },
    auth: {
      login_title: 'เข้าสู่ระบบ',
      login_desc: 'เข้าสู่ระบบเพื่อขอความช่วยเหลือหรือเป็นอาสาสมัคร',
      send_link: 'ส่งลิงก์เข้าสู่ระบบ',
      sign_out: 'ออกจากระบบ',
    }
  }
};
