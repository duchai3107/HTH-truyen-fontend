import ViewOrder from "../../components/Order/ViewOrder";
import { Breadcrumb, Spin, Button } from 'antd';
import './order.scss';
import { useState, useEffect } from "react";
import { HomeOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { callFetchBookById } from "../../services/api";
import { message } from 'antd';

const OrderPage = (props) => {
    const [loading, setLoading] = useState(false);
    const [bookData, setBookData] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const [currentChapter, setCurrentChapter] = useState(null);
    const [totalChapters, setTotalChapters] = useState(0);
    const [showFixedNav, setShowFixedNav] = useState(false);

    useEffect(() => {
        const fetchBook = async () => {
            if (!id) {
                navigate('/');
                return;
            }

            setLoading(true);
            try {
                const res = await callFetchBookById(id);
                if (res?.data) {
                    const params = new URLSearchParams(location.search);
                    const chapterNum = parseInt(params.get('chapter')) || 1;
                    
                    const formattedImages = res.data.slider.map((image, index) => ({
                        url: `${import.meta.env.VITE_BACKEND_URL}/images/book/${image}`,
                        title: `Trang ${index + 1}`
                    }));

                    const totalChaps = Math.floor(formattedImages.length / 7);
                    setTotalChapters(totalChaps);

                    if (chapterNum) {
                        const startIndex = (chapterNum - 1) * 7;
                        const chapterImages = formattedImages.slice(startIndex, startIndex + 7);
                        setCurrentChapter(chapterNum);
                        setBookData({
                            ...res.data,
                            formattedImages: chapterImages
                        });
                    } else {
                        setBookData({
                            ...res.data,
                            formattedImages
                        });
                    }
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin sách:", error);
                message.error("Không thể tải thông tin sách");
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [id, location.search]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setShowFixedNav(true);
            } else {
                setShowFixedNav(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleChangeChapter = (direction) => {
        if (!currentChapter) return;
        
        let nextChapter;
        if (direction === 'prev') {
            nextChapter = currentChapter - 1;
        } else {
            nextChapter = currentChapter + 1;
        }

        navigate(`/order/${id}?chapter=${nextChapter}`);
    };

    return (
        <div style={{ background: '#1a1a1a', padding: "20px 0" }}>
            <div className="order-container" style={{ maxWidth: 1440, margin: '0 auto' }}>
                {loading ? (
                    <div className="loading-container">
                        <Spin tip="Đang tải..." />
                    </div>
                ) : (
                    bookData?.formattedImages && (
                        <div className="vertical-slider">
                            <Link to={'/'} className="home-link">
                                <HomeOutlined /> Trang Chủ
                            </Link>
                            
                            <div className={`chapter-navigation ${showFixedNav ? 'fixed' : ''}`}>
                                <Button 
                                    disabled={currentChapter === 1}
                                    onClick={() => handleChangeChapter('prev')}
                                    icon={<LeftOutlined />}
                                />
                                <span className="current-chapter">
                                    Chapter {currentChapter}
                                </span>
                                <Button 
                                    disabled={currentChapter === totalChapters}
                                    onClick={() => handleChangeChapter('next')}
                                    icon={<RightOutlined />}
                                />
                            </div>

                            {bookData.formattedImages.map((image, index) => (
                                <div key={index} className="slider-item">
                                    <img
                                        src={image.url}
                                        className="slider-image"
                                    />
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default OrderPage;