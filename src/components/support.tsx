import { AlipayOutlined, HeartOutlined, WechatOutlined } from "@ant-design/icons";
import { Button, Popover, Space, Image } from "antd";
import qrcode1 from '@/assets/qrcode/qrcode1.png';
import qrcode2 from '@/assets/qrcode/qrcode2.jpg';
import { useState } from "react";

const SupportButton = (props: any) => {

    const [qrcode, setQrcode] = useState<string | undefined>();

    const content = (
        <Space direction="vertical" style={{ textAlign: "center" }} >
            谢谢投喂喵 (●'◡'●)
            <Space>
                <Button icon={<WechatOutlined />} onClick={() => setQrcode(qrcode1)}>微信</Button>
                <Button icon={<AlipayOutlined />} onClick={() => setQrcode(qrcode2)}>支付宝</Button>
            </Space>
            {qrcode && <Image src={qrcode} width={200} />}
        </Space>
    )

    return (
        <Popover content={content} onOpenChange={(open) => {
            if (!open) setQrcode(undefined);
        }} >
            <Button
                type="outlined"
                style={{ color: 'white', borderColor: 'white', ...props.style }}
                icon={<HeartOutlined />}
            >投喂
            </Button>
        </Popover>
    );
};


export default SupportButton;