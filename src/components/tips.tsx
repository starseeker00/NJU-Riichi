import { QuestionCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";

export const infoTooltip = ({ title }: { title: string }) => (
    <Tooltip title={title}>
        <QuestionCircleOutlined style={{ marginLeft: 4, color: 'grey' }} />
    </Tooltip>
)