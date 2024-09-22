import { Tag } from "antd";

const legend = ['役满', '累计役满']
const epic = ['三倍满', '立一摸里三', 'w立直', '小三元', '两杯口', '混老头', '枪杠', '三同刻', '三杠子']
const rare = ['倍满', '清一色', '三暗刻', '纯全']
export const preset = { legend, epic, rare }

const MahjongTags = (props: { tag: string }) => {
    const { tag } = props;

    function getColor(tag: string) {
        if (legend.some(t => tag.includes(t))) {
            return 'gold';
        } else if (epic.some(t => tag.includes(t))) {
            return 'orange';
        } else if (rare.some(t => tag.includes(t))) {
            return 'purple';
        } else {
            switch (tag) {
                case '立一摸':
                    return 'cyan';
                case '里三':
                    return 'blue';
                case '岭上开花':
                    return 'green';
                case '海底摸月':
                case '河底捞鱼':
                    return 'geekblue';
                case '大吊车':
                    return 'magenta';
                case '一炮多响':
                    return 'volcano';
                case '烧鸡':
                    return 'red';
                default:
                    return 'default';
            }
        }
    }

    return (
        <Tag color={getColor(tag)}>{tag}</Tag>
    );
};

export default MahjongTags;