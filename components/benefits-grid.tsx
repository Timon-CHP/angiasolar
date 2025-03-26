import { CircleDollarSign, Clock, TrendingUp, Wrench, FileText, Plug } from "lucide-react"

export default function BenefitsGrid() {
  const benefits = [
    {
      icon: <CircleDollarSign className="h-6 w-6 text-yellow-200" />,
      title: "Tiết kiệm đến",
      value: "80%",
      description: "Tiền điện mỗi tháng",
      bgColor: "bg-amber-600",
    },
    {
      icon: <CircleDollarSign className="h-6 w-6 text-yellow-100" />,
      title: "Hỗ trợ trả chậm đến",
      value: "80%",
      description: "giá trị hợp đồng",
      bgColor: "bg-orange-600",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-yellow-200" />,
      title: "Hiệu quả đầu tư gấp",
      value: "4 LẦN",
      description: "Lãi suất ngân hàng",
      bgColor: "bg-amber-600",
    },
    {
      icon: <Clock className="h-6 w-6 text-yellow-100" />,
      title: "Thời gian thu hồi vốn",
      value: "NHỎ HƠN",
      description: "Thời hạn bảo hành",
      bgColor: "bg-orange-600",
    },
    {
      icon: <Wrench className="h-6 w-6 text-yellow-200" />,
      title: "KHÔNG",
      description: "Phí bảo trì, bảo dưỡng Chỉ phí ổn",
      bgColor: "bg-amber-600",
    },
    {
      icon: <FileText className="h-6 w-6 text-yellow-100" />,
      title: "KHÔNG",
      description: "Ảnh hưởng đến kết cấu nhà, hệ thống điện",
      bgColor: "bg-orange-600",
    },
    {
      icon: <FileText className="h-6 w-6 text-yellow-200" />,
      title: "KHÔNG",
      description: "Thủ tục pháp lý, rườm rà",
      bgColor: "bg-amber-600",
    },
    {
      icon: <Plug className="h-6 w-6 text-yellow-100" />,
      title: "KHÔNG",
      description: "Ảnh hưởng đến kết nối điện với EVN",
      bgColor: "bg-orange-600",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {benefits.map((benefit, index) => (
        <div key={index} className={`${benefit.bgColor} rounded-lg p-4 flex flex-col items-center text-center`}>
          <div className="mb-2">{benefit.icon}</div>
          <div className="text-white">
            <div className="font-bold">{benefit.title}</div>
            {benefit.value && <div className="text-xl font-bold">{benefit.value}</div>}
            <div className="text-sm">{benefit.description}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

