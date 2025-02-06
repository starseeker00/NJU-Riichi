import React, { useEffect, useState } from 'react';
import type { TableProps } from 'antd';
import { Button, Form, Input, InputNumber, Popconfirm, Select, Table, Typography } from 'antd';
import { addSchedule, deleteSchedule, getSchedule, updateSchedule } from '@/services/schedule';
import { useParams } from 'umi';
import { useAuth0 } from '@auth0/auth0-react';
import { checkScope, wrapScope } from '@/util/auth';

interface DataType {
    key: string;
    time_point: Date;
    description: string;
    property: number;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: any;
    inputType: 'number' | 'text' | 'date' | 'property';
    record: DataType;
    index: number;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
}) => {
    const inputNode =
        inputType === 'text' ? <Input /> :
            inputType === 'number' ? <InputNumber /> :
                inputType === 'date' ? <Input type='date' /> :
                    inputType === 'property' ? <Select>
                        <Select.Option value={0}>自由匹配（牌谱不计入统计）</Select.Option>
                        <Select.Option value={1}>初赛/常规赛（牌谱单独计入统计）</Select.Option>
                        <Select.Option value={2}>复赛/季后赛（牌谱单独计入统计）</Select.Option>
                        <Select.Option value={3}>决赛（牌谱单独计入统计）</Select.Option>
                    </Select> : null;

    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{ margin: 0 }}
                    rules={[
                        {
                            required: true,
                            message: `请填写${title}!`,
                        },
                    ]}
                >
                    {inputNode}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};

const GameSchedule: React.FC = () => {
    const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
    const [couldUpdate, setCouldUpdate] = useState(false);
    const [token, setToken] = useState<string>('');

    useEffect(() => {
        if (isAuthenticated) {
            const scope = 'update:contest';
            getAccessTokenSilently(wrapScope(scope)).then((token) => {
                const couldUpdate = checkScope(token, scope);
                setCouldUpdate(couldUpdate);
                setToken(token);
            });
        }
    }, [isAuthenticated]);

    const [form] = Form.useForm();
    const [data, setData] = useState<DataType[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingKey, setEditingKey] = useState('');

    const params = useParams<{ id: string }>();

    useEffect(() => {
        setLoading(true);
        getSchedule(Number(params.id)).then((res) => {
            setData(res.data.map((item: any) => ({ ...item, key: item.id.toString() })));
            setLoading(false);
        });
    }, [params.id]);

    const isEditing = (record: DataType) => record.key === editingKey;

    const edit = (record: Partial<DataType> & { key: React.Key }) => {
        form.setFieldsValue({ name: '', age: '', address: '', ...record });
        setEditingKey(record.key);
    };

    const cancel = () => {
        if (editingKey === 'new') {
            setData(data.slice(1));
        }
        setEditingKey('');
    };

    const save = async (key: React.Key) => {
        try {
            setLoading(true);

            // console.log(form)
            const row = (await form.validateFields()) as DataType;

            if (key === 'new') {
                await addSchedule({
                    ...row,
                    contest_id: Number(params.id),
                }, token);
            } else {
                await updateSchedule({ ...row, id: key }, token);
            }
            setEditingKey('');

            await getSchedule(Number(params.id)).then((res) => {
                setData(res.data.map((item: any) => ({ ...item, key: item.id.toString() })));
                setLoading(false);
            });
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
            setLoading(false);
        }
    };

    const remove = async (key: React.Key) => {
        setLoading(true);
        await deleteSchedule(Number(key), token);
        await getSchedule(Number(params.id)).then((res) => {
            setData(res.data.map((item: any) => ({ ...item, key: item.id.toString() })));
            setLoading(false);
        });
    }

    const columns = [
        {
            title: '时间节点',
            dataIndex: 'time_point',
            width: '20%',
            editable: true,
        },
        {
            title: '描述',
            dataIndex: 'description',
            editable: true,
        },
        {
            title: '性质',
            dataIndex: 'property',
            width: '25%',
            editable: true,
            render: (text: number) => {
                switch (text) {
                    case 0:
                        return '自由匹配';
                    case 1:
                        return '初赛/常规赛';
                    case 2:
                        return '复赛/季后赛';
                    case 3:
                        return '决赛';
                    default:
                        return '未知';
                }
            },
        },
        {
            title: 'operation',
            dataIndex: 'operation',
            hidden: !isAuthenticated || user?.name !== 'starseeker',
            render: (_: any, record: DataType) => {
                const editable = isEditing(record);
                return editable ? (
                    <span>
                        <Typography.Link onClick={() => save(record.key)} style={{ marginInlineEnd: 8 }}>
                            保存
                        </Typography.Link>
                        <Popconfirm title="不保存编辑？" onConfirm={cancel} cancelText={'取消'} okText={'确定'}>
                            <a>取消</a>
                        </Popconfirm>
                    </span>
                ) : (
                    <span>
                        <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)} style={{ marginInlineEnd: 8 }}>
                            编辑
                        </Typography.Link>
                        <Popconfirm title="确认删除？" onConfirm={() => remove(record.key)} cancelText={'取消'} okText={'确定'}>
                            <Typography.Link disabled={editingKey !== ''} type='danger'>
                                删除
                            </Typography.Link>
                        </Popconfirm>
                    </span>
                );
            },
        },
    ];

    const mergedColumns: TableProps<DataType>['columns'] = columns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: DataType) => ({
                record,
                inputType: (function () {
                    switch (col.dataIndex) {
                        case 'time_point':
                            return 'date';
                        case 'property':
                            return 'property';
                        default:
                            return 'text';
                    }
                })(),
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    return (
        <Form form={form} component={false}>
            <Button
                style={{ position: 'absolute', top: 0, right: 0, margin: 8 }}
                type="link"
                disabled={editingKey !== '' || !couldUpdate}
                onClick={() => {
                    setData([{ key: 'new', time_point: new Date(), description: '', property: 0 }, ...data]);
                    edit({ key: 'new', time_point: undefined, description: '', property: 0 });
                }}>添加赛程</Button>
            <Table<DataType>
                components={{
                    body: { cell: EditableCell },
                }}
                bordered
                loading={loading}
                dataSource={data}
                columns={mergedColumns}
                pagination={{ onChange: cancel }}
            />
        </Form>
    );
};

export default GameSchedule;