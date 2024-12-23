// src/components/Book/ViewDetail.jsx
import { Row, Col, Rate, Divider, Button, Breadcrumb, List, Form ,Input, Table, Spin} from 'antd';
import './book.scss';
import ImageGallery from 'react-image-gallery';
import { useEffect, useRef, useState } from 'react';
import ModalGallery from './ModalGallery';
import { MinusOutlined, PlusOutlined, HomeOutlined, HeartOutlined, HeartFilled, EyeOutlined, MessageOutlined } from '@ant-design/icons';
import { BsCartPlus } from 'react-icons/bs';
import BookLoader from './BookLoader';
import { useDispatch, useSelector } from 'react-redux';
import { doAddBookAction, doPlaceOrderAction } from '../../redux/order/orderSlice';
import { Link, useNavigate } from 'react-router-dom';
import { callFetchListOrder, callPlaceOrder } from '../../services/api';
import { message, notification } from 'antd';
import { motion } from 'framer-motion';
import './ViewDetail.scss';

const { TextArea } = Input;

const ViewDetail = (props) => {
    const { dataBook } = props;
    const [isOpenModalGallery, setIsOpenModalGallery] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentQuantity, setCurrentQuantity] = useState(1);
    const [form] = Form.useForm();

    const refGallery = useRef(null);
    const images = dataBook?.items ?? [];
    const dispatch = useDispatch();
    const [isSubmit, setIsSubmit] = useState(false);
    const navigate = useNavigate();
    const carts = useSelector(state => state.order.carts);
    const user = useSelector(state => state.account.user);
    //them address
    const name=user.fullName;
    const phone='123456789';
    const totalPrice=100000;
    const quantity=currentQuantity;
    const [isLiked, setIsLiked] = useState(false);
    const [chapters, setChapters] = useState([]);
    const [averageRating, setAverageRating] = useState(4.5);
    const [totalRatings, setTotalRatings] = useState(1234);
    const [userRating, setUserRating] = useState(0);
    const [hasRated, setHasRated] = useState(false);
    const [ratingStats, setRatingStats] = useState([
        { stars: 5, count: 800 },
        { stars: 4, count: 300 },
        { stars: 3, count: 100 },
        { stars: 2, count: 30 },
        { stars: 1, count: 4 }
    ]);

    const onFinish = async (values) => {
        setIsSubmit(true);
        const detailOrder = carts.map(item => {
            return {
                bookName: item.detail.mainText,
                quantity: quantity,
                _id: item._id
            }
        })
        const data = {
            name: name,
            address: values.address,
            phone: phone,
            totalPrice: totalPrice,
            detail: detailOrder
        }

        const res = await callPlaceOrder(data);
        if(res && res.data){
            message.success('Comment success')
            fetchOrder();
        }
        form.resetFields();
        setIsSubmit(false);
    }
    //lay ra address
    const [listOrder, setListOrder] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [total, setTotal] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=-createdAt");

    useEffect(() => {
        fetchOrder();
    }, [current, pageSize, filter, sortQuery]);

    useEffect(() => {
        if (dataBook?.slider) {
            // Tạo chapters từ slider images
            const chaptersData = [];
            const imagesPerChapter = 7;
            let chapterCount = 1;

            for (let i = 0; i < dataBook.slider.length; i += imagesPerChapter) {
                const chapterImages = dataBook.slider.slice(i, i + imagesPerChapter);
                if (chapterImages.length === imagesPerChapter) {
                    chaptersData.push({
                        number: chapterCount,
                        images: chapterImages,
                        startIndex: i
                    });
                    chapterCount++;
                }
            }
            setChapters(chaptersData);
        }
    }, [dataBook]);

    const fetchOrder = async () => {
        setIsLoading(true)
        let query = `current=${current}&pageSize=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const res = await callFetchListOrder(query);
        if (res && res.data) {
            setListOrder(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false)
    }
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
        },
        {
            title: 'Comment',
            dataIndex: 'address',
        },
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
    const renderHeader = () => {
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', gap: 15 }}>
                    <Button type='ghost' onClick={() => {
                        setFilter("");
                        setSortQuery("")
                    }}>
                    </Button>
                </span>
            </div>
        )
    }



    const handleOnClickImage = () => {
        setIsOpenModalGallery(true);
        setCurrentIndex(refGallery?.current?.getCurrentIndex() ?? 0);
    };

    const handleChangeButton = (type) => {
        if (type === 'MINUS') {
            if (currentQuantity - 1 <= 0) return;
            setCurrentQuantity(currentQuantity - 1);
        }
        if (type === 'PLUS') {
            if (currentQuantity === +dataBook.quantity) return; //max
            setCurrentQuantity(currentQuantity + 1);
        }
    };

    const handleChangeInput = (value) => {
        if (!isNaN(value)) {
            if (+value > 0 && +value < +dataBook.quantity) {
                setCurrentQuantity(+value);
            }
        }
    };

    const handleAddToCart = (book) => {
        dispatch(doAddBookAction({ detail: book, _id: book._id }));
    };

    const handleBuyNow = async () => {
        const detailOrder = [{
            bookName: dataBook.mainText,
            quantity: currentQuantity,
            _id: dataBook._id
        }];
        const address = "Hà Nội";
        const data = {
            name: user.fullName,
            address: address,
            phone: user.phone,
            totalPrice: dataBook.price * currentQuantity,
            detail: detailOrder
        };

        const res = await callPlaceOrder(data);
        navigate(`/order/${dataBook._id}`);
    };

    const handleReadChapter = (chapter) => {
        navigate(`/order/${dataBook._id}?chapter=${chapter.number}`);
    };

    const isAuthenticated = useSelector(state => state.account.isAuthenticated);

    const handleComment = () => {
        if (!isAuthenticated) {
            notification.warning({
                message: 'Vui lòng đăng nhập',
                description: 'Bạn cần đăng nhập để có thể bình luận!',
                btn: (
                    <Button type="primary" onClick={() => navigate('/login')}>
                        Đăng nhập ngay
                    </Button>
                ),
                duration: 3,
            });
            return;
        }
        form.submit();
    };

    const breadcrumbItems = [
        {
            title: (
                <Link to="/">
                    <HomeOutlined /> Trang Chủ
                </Link>
            ),
        },
        {
            title: dataBook?.category || 'Chi tiết truyện'
        }
    ];

    const handleRatingChange = (value) => {
        if (!isAuthenticated) {
            notification.warning({
                message: 'Vui lòng đăng nhập',
                description: 'Bạn cần đăng nhập để đánh giá!',
                btn: (
                    <Button type="primary" onClick={() => navigate('/login')}>
                        Đăng nhập ngay
                    </Button>
                ),
                duration: 3,
            });
            return;
        }

        if (!hasRated) {
            // Cập nhật số lượng đánh giá cho số sao tương ứng
            setRatingStats(prev => prev.map(stat => {
                if (stat.stars === value) {
                    return { ...stat, count: stat.count + 1 };
                }
                return stat;
            }));

            // Cập nhật tổng số đánh giá và điểm trung bình
            const newTotalRatings = totalRatings + 1;
            const totalStars = ratingStats.reduce((acc, curr) => {
                return acc + (curr.stars * curr.count);
            }, value); // Thêm đánh giá mới vào tổng
            
            setTotalRatings(newTotalRatings);
            setAverageRating(totalStars / newTotalRatings);
            setUserRating(value);
            setHasRated(true);

            message.success('Cảm ơn bạn đã đánh giá!');
        } else {
            message.info('Bạn đã đánh giá truyện này rồi!');
        }
    };

    return (
        <div className="view-detail-container">
            <div className="view-detail-content">
                <Breadcrumb 
                    className="breadcrumb"
                    items={breadcrumbItems}
                />

                {dataBook && dataBook._id ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="book-content"
                    >
                        <Row gutter={[32, 32]}>
                            <Col md={10} sm={24}>
                                <div className="image-gallery-wrapper">
                                    <ImageGallery
                                        ref={refGallery}
                                        items={images}
                                        showPlayButton={false}
                                        showFullscreenButton={false}
                                        renderLeftNav={() => <></>}
                                        renderRightNav={() => <></>}
                                        slideOnThumbnailOver={true}
                                        onClick={handleOnClickImage}
                                        additionalClass="custom-image-gallery"
                                    />
                                </div>
                            </Col>

                            <Col md={14} sm={24}>
                                <div className="book-details">
                                    <motion.h1 
                                        className="book-title"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        {dataBook?.mainText}
                                    </motion.h1>

                                    <div className="book-meta">
                                        <div className="author">
                                            <span>Tác giả: {dataBook?.author}</span>
                                        </div>
                                        <div className="category-tag">
                                            {dataBook?.category}
                                        </div>
                                    </div>

                                    <div className="stats-container">
                                        <div className="stat-item">
                                            <EyeOutlined />
                                            <span>19,990 lượt xem</span>
                                        </div>
                                        <div className="stat-item">
                                            <HeartOutlined />
                                            <span>12,345 lượt thích</span>
                                        </div>
                                        <div className="stat-item">
                                            <MessageOutlined />
                                            <span>{total} bình luận</span>
                                        </div>
                                    </div>

                                    <div className="action-buttons">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="primary-button"
                                            onClick={() => handleBuyNow()}
                                        >
                                            Đọc Truyện
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="secondary-button"
                                            onClick={() => handleAddToCart(dataBook)}
                                        >
                                            Thêm vào thư viện
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`like-button ${isLiked ? 'liked' : ''}`}
                                            onClick={() => setIsLiked(!isLiked)}
                                        >
                                            {isLiked ? <HeartFilled /> : <HeartOutlined />}
                                        </motion.button>
                                    </div>
                                    <div className="rating-section">
                            <div className="rating-header">
                                <div className="rating-average">{averageRating.toFixed(1)}</div>
                                <div>
                                    <Rate 
                                        value={userRating || averageRating} 
                                        onChange={handleRatingChange}
                                        allowHalf
                                        disabled={hasRated}
                                    />
                                    <div className="rating-count">
                                        {totalRatings} đánh giá
                                        {hasRated && <span className="user-rated"> • Bạn đã đánh giá {userRating} sao</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="rating-stats">
                                {ratingStats.map((stat) => (
                                    <div key={stat.stars} className="rating-bar">
                                        <span className="star-label">{stat.stars} sao</span>
                                        <div className="progress-bar">
                                            <div 
                                                className="progress" 
                                                style={{ 
                                                    width: `${(stat.count / totalRatings) * 100}%` 
                                                }}
                                            />
                                        </div>
                                        <span className="count">{stat.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                                </div>
                            </Col>
                        </Row>

                        <Divider />

                        <div className="chapters-section">
                            <h2>Danh sách Chapter</h2>
                            <div className="chapters-list">
                                {chapters.map((chapter) => (
                                    <div 
                                        key={chapter.number}
                                        className="chapter-item"
                                        onClick={() => handleReadChapter(chapter)}
                                        style={{ width: '1000px' }}
                                    >
                                        <span className="chapter-number">Chapter {chapter.number}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Divider />

                        <div className="comments-section">
                            <h2>Bình luận ({total})</h2>
                            
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="comments-list"
                            >
                                {isLoading ? (
                                    <div className="loading-spinner">
                                        <Spin size="large" />
                                    </div>
                                ) : (
                                    listOrder.map((order) => (
                                        <motion.div
                                            key={order._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="comment-item"
                                        >
                                            <div className="comment-header">
                                                <img 
                                                    src={`https://ui-avatars.com/api/?name=${order.name}`}
                                                    alt={order.name}
                                                    className="commenter-avatar"
                                                />
                                                <span className="commenter-name">{order.name}</span>
                                            </div>
                                            <div className="comment-content">
                                                {order.address}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </motion.div>

                            <div className="comment-form">
                                <Form
                                    form={form}
                                    onFinish={onFinish}
                                    className="comment-form-inner"
                                >
                                    <Form.Item
                                        name="address"
                                        className="comment-input"
                                    >
                                        <TextArea
                                            autoFocus
                                            rows={4}
                                            placeholder={isAuthenticated ? "Chia sẻ suy nghĩ của bạn..." : "Đăng nhập để bình luận..."}
                                            disabled={!isAuthenticated}
                                        />
                                    </Form.Item>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`submit-comment ${!isAuthenticated ? 'disabled' : ''}`}
                                        onClick={handleComment}
                                        disabled={isSubmit || !isAuthenticated}
                                    >
                                        {isSubmit ? 'Đang gửi...' : 'Gửi bình luận'}
                                    </motion.button>
                                </Form>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <BookLoader />
                )}
            </div>
            
            <ModalGallery
                isOpen={isOpenModalGallery}
                setIsOpen={setIsOpenModalGallery}
                currentIndex={currentIndex}
                items={images}
                title={dataBook?.mainText}
            />
        </div>
    );
};

export default ViewDetail;