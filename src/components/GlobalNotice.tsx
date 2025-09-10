import { getLatestNotice } from "@/services/api";
import { Button, Checkbox, Modal, Radio } from "antd"
import { useEffect, useState } from "react"

const GlobalNotice = () => {

    const [notice, setNotice] = useState<string | null>(null);
    const [updateTime, setUpdateTime] = useState<number>(0);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        getLatestNotice().then((res) => {
            if (res.data.content) {
                setNotice(res.data.content);
                setUpdateTime(new Date(res.data.create_time).getTime());
                console.log(new Date(res.data.create_time).getTime());
            } else {
                setNotice(null);
            }
        })
    }, []);

    function close() {
        setNotice(null);
        if (checked) {
            localStorage.setItem('last_notice', updateTime.toString());
        }
    }

    return (
        <Modal
            title="公告"
            open={notice !== null && updateTime > parseInt(localStorage.getItem('last_notice') || '0') }
            footer={
                <Button type="primary" onClick={close}>
                    我知道了
                </Button>
            }
            closable={false}
            centered
            width={600}
        >
            <div style={{ marginBottom: 16 }}>
                {notice}
            </div>
            <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)}>
                {'今后不再显示此公告'}
            </Checkbox>
        </Modal>
    )

}

export default GlobalNotice;