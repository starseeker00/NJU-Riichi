import { Tag } from "antd";

const MahjongTags = (props: { tag: string }) => {
    const { tag } = props;

    function getColor(tag: string) {
        switch (tag) {
            case '役满':
                return 'gold';
            case 'w立直':
                return 'orange';
            case '立一摸里三':
                return 'purple';
            case '立一摸':
                return 'cyan';
            case '里三':
                return 'blue';
            case '大吊车':
                return 'magenta';
            case '烧鸡':
                return 'red';
            default:
                return 'default';
        }
    }

    return (
        <Tag color={getColor(tag)}>{tag}</Tag>
    );
};

export default MahjongTags;