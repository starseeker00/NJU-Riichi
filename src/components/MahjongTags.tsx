import { Tag } from "antd";

const MahjongTags = (props: { tag: string }) => {
    const { tag } = props;

    function getColor(tag: string) {
        switch (tag) {
            case '烧鸡':
                return 'red';
            case '役满':
                return 'gold';
            case 'w立直':
                return 'cyan';
            case '立一摸':
                return 'green';
            case '里三':
                return 'purple';
            default:
                return 'blue';
        }
    }

    return (
        <Tag color={getColor(tag)}>{tag}</Tag>
    );
};

export default MahjongTags;