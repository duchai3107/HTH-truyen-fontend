import React, { useEffect, useState } from 'react';
import { Table, Row, Col, Popconfirm, Button, message, notification } from 'antd';
import InputSearchData from './InputSearchData';
import { callDeleteBook, callFetchListBook, callResetSlider } from '../../../services/api';
import { DeleteTwoTone, EditTwoTone, ReloadOutlined } from '@ant-design/icons';
import moment from 'moment/moment';
import { FORMAT_DATE_DISPLAY } from '../../../utils/constant';
import Databookupdate from './Databookupdate';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

const MangeOrder = () => {
    const navigate = useNavigate();
    const [listBook, setListBook] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [total, setTotal] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=-updatedAt");

    const [openModalCreate, setOpenModalCreate] = useState(false);
    const [openViewDetail, setOpenViewDetail] = useState(false);
    const [dataViewDetail, setDataViewDetail] = useState(null);

    const [openModalUpdate, setOpenModalUpdate] = useState(false);
    const [dataUpdate, setDataUpdate] = useState(null);

    useEffect(() => {
        fetchBook();
    }, [current, pageSize, filter, sortQuery]);

    const fetchBook = async () => {
        setIsLoading(true)
        let query = `current=${current}&pageSize=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const res = await callFetchListBook(query);
        if (res && res.data) {
            setListBook(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false)
    }

    const handleViewBookDetail = (record) => {
        const slug = convertSlug(record.mainText);
        navigate(`/book/${slug}?id=${record._id}`);
    };

    const convertSlug = (str) => {
        str = str.toLowerCase();
        str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
        str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
        str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
        str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
        str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
        str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
        str = str.replace(/(đ)/g, 'd');
        str = str.replace(/([^0-9a-z-\s])/g, '');
        str = str.replace(/(\s+)/g, '-');
        str = str.replace(/^-+/g, '');
        str = str.replace(/-+$/g, '');
        return str;
    };

    const columns = [
        {
            title: 'Id',
            dataIndex: '_id',
            width: 100
        },
        {
            title: 'Ảnh',
            dataIndex: 'thumbnail',
            width: 100,
            render: (text, record) => {
                return (
                    <img
                        src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${record.thumbnail}`}
                        style={{ 
                            height: '60px', 
                            width: '45px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                        onClick={() => handleViewBookDetail(record)}
                        alt={record.mainText}
                    />
                )
            }
        },
        {
            title: 'Tên sách',
            dataIndex: 'mainText',
            sorter: true,
            render: (text, record) => {
                return (
                    <div 
                        style={{ 
                            cursor: 'pointer',
                            color: '#1890ff',
                            fontWeight: 500
                        }}
                        onClick={() => handleViewBookDetail(record)}
                    >
                        {text}
                        <div style={{ 
                            fontSize: '13px', 
                            color: '#666',
                            fontWeight: 'normal',
                            marginTop: '4px'
                        }}>
                            {record.author}
                        </div>
                    </div>
                )
            }
        },
        {
            title: 'Thể loại',
            dataIndex: 'category',
            sorter: true
        },
        {
            title: 'Tác giả',
            dataIndex: 'author',
            sorter: true,
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            sorter: true,
            render: (text, record, index) => {
                return (
                    <>{moment(record.updatedAt).format(FORMAT_DATE_DISPLAY)}</>
                )
            }

        },
        {
            title: 'Action',
            width: 150,
            render: (text, record, index) => {
                return (
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa book"}
                            description={"Bạn có chắc chắn muốn xóa truyện này ?"}
                            onConfirm={() => handleDeleteBook(record._id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <span style={{ cursor: "pointer" }}>
                                <DeleteTwoTone twoToneColor="#ff4d4f" />
                            </span>
                        </Popconfirm>

                        <EditTwoTone
                            twoToneColor="#f57800" 
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                setOpenModalUpdate(true);
                                setDataUpdate(record);
                            }}
                        />

                        <Popconfirm
                            placement="leftTop"
                            title={"Reset slider"}
                            description={"Bạn có chắc chắn muốn reset lại nội dung không?"}
                            onConfirm={() => handleResetSlider(record._id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <ReloadOutlined
                                style={{ 
                                    cursor: "pointer",
                                    color: '#1890ff'
                                }}
                            />
                        </Popconfirm>
                    </div>
                )
            }
        }
    ];

    const onChange = (pagination, filters, sorter, extra) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }
        if (sorter && sorter.field) {
            const q = sorter.order === 'ascend' ? `sort=${sorter.field}` : `sort=-${sorter.field}`;
            setSortQuery(q);
        }
    };

    const handleDeleteBook = async (id) => {
        const res = await callDeleteBook(id);
        if (res && res.data) {
            message.success('Xóa truyện thành công');
            fetchBook();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message
            });
        }
    };

    const handleResetSlider = async (bookId) => {
        try {
            const res = await callResetSlider(bookId);
            if (res?.data) {
                message.success('Reset slider thành công');
                fetchBook(); // Refresh data
            }
        } catch (error) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error.message || 'Không thể reset slider'
            });
        }
    };

    const renderHeader = () => {
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Table List </span>
                <span style={{ display: 'flex', gap: 15 }}>
                    <Button type='ghost' onClick={() => {
                        setFilter("");
                        setSortQuery("")
                    }}>
                        <ReloadOutlined />
                    </Button>
                </span>
            </div>
        )
    }

    const handleSearch = (query) => {
        setFilter(query);
    }

    const handleExportData = () => {
        if (listBook.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(listBook);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            XLSX.writeFile(workbook, "ExportBook.csv");
        }
    }

    return (
        <>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <InputSearchData
                        handleSearch={handleSearch}
                        setFilter={setFilter}
                    />
                </Col>
                <Col span={24}>
                    <Table
                        title={renderHeader}
                        loading={isLoading}
                        columns={columns}
                        dataSource={listBook}
                        onChange={onChange}
                        rowKey="_id"
                        pagination={
                            {
                                current: current,
                                pageSize: pageSize,
                                showSizeChanger: true,
                                total: total,
                                showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
                            }
                        }
                    />
                </Col>
            </Row>
            <Databookupdate
                openModalUpdate={openModalUpdate}
                setOpenModalUpdate={setOpenModalUpdate}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                fetchBook={fetchBook}
            />
        </>
    )
}

export default MangeOrder;