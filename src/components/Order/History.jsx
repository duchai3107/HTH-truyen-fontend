import { Badge, Table, Tag, Space } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import { callOrderHistory, callFetchBookById } from "../../services/api";
import { FORMAT_DATE_DISPLAY } from "../../utils/constant";
import { useNavigate } from "react-router-dom";
import './history.scss';

const History = () => {
    const [orderHistory, setOrderHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await callOrderHistory();
            if (res && res.data) {
                // Fetch thêm thông tin chi tiết của từng book
                const historyWithDetails = await Promise.all(
                    res.data.map(async (item) => {
                        if (item.detail?.[0]?._id) {
                            const bookRes = await callFetchBookById(item.detail[0]._id);
                            if (bookRes?.data) {
                                return {
                                    ...item,
                                    detail: [{
                                        ...item.detail[0],
                                        thumbnail: bookRes.data.thumbnail,
                                        mainText: bookRes.data.mainText
                                    }]
                                };
                            }
                        }
                        return item;
                    })
                );
                setOrderHistory(historyWithDetails);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        }
        setLoading(false);
    };

    const handleViewBook = (record) => {
        if (record.detail?.[0]?._id) {
            const slug = convertSlug(record.detail[0].mainText || '');
            navigate(`/book/${slug}?id=${record.detail[0]._id}`);
        }
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
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            width: 60,
            render: (_, record, index) => (<>{index + 1}</>)
        },
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => (
                <span>{moment(date).format(FORMAT_DATE_DISPLAY)}</span>
            )
        },
        {
            title: 'Tên truyện',
            key: 'bookName',
            render: (_, record) => {
                const firstDetail = record.detail?.[0];
                return (
                    <Space align="center" size={12}>
                        {firstDetail?.thumbnail && (
                            <img 
                                src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${firstDetail.thumbnail}`}
                                alt={firstDetail.mainText || firstDetail.bookName}
                                className="book-thumbnail"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://placehold.co/60x80?text=No+Image';
                                }}
                            />
                        )}
                        {firstDetail ? (
                            <div 
                                className="book-title"
                                onClick={() => handleViewBook(record)}
                            >
                                {firstDetail.mainText || firstDetail.bookName}
                            </div>
                        ) : (
                            <Tag color="error">Không có dữ liệu</Tag>
                        )}
                    </Space>
                );
            }
        },
        {
            title: 'Trạng thái',
            key: 'status',
            align: 'center',
            render: (_, record) => (
                <Badge 
                    status="success" 
                    text="Đã đọc"
                    className="status-badge"
                />
            )
        }
    ];

    return (
        <div className="history-container">
            <h2 className="history-title">Lịch sử đọc truyện</h2>
            <Table 
                columns={columns} 
                dataSource={orderHistory} 
                loading={loading}
                pagination={false}
                rowKey="_id"
                className="history-table"
            />
        </div>
    )
}

export default History;