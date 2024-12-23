import React, { useState } from 'react';
import { FaReact } from 'react-icons/fa'
import { FiShoppingCart } from 'react-icons/fi';
import { VscSearchFuzzy } from 'react-icons/vsc';
import { Divider, Badge, Drawer, message, Avatar, Popover, Empty, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { DownOutlined, RightOutlined, DeleteOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import { useNavigate } from 'react-router';
import { callLogout } from '../../services/api';
import './header.scss';
import { doLogoutAction } from '../../redux/account/accountSlice';
import { Link } from 'react-router-dom';
import ManageAccount from '../Account/ManageAccount';
import { FaBook } from "react-icons/fa";
import { doDeleteBookAction } from '../../redux/order/orderSlice';

const Header = (props) => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const isAuthenticated = useSelector(state => state.account.isAuthenticated);
    const user = useSelector(state => state.account.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const carts = useSelector(state => state.order.carts);
    const [showManageAccount, setShowManageAccount] = useState(false);

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && res.data) {
            dispatch(doLogoutAction());
            message.success('Đăng xuất thành công');
            navigate('/')
        }
    }

    const handleViewBookDetail = (book) => {
        const slug = convertSlug(book?.detail?.mainText);
        navigate(`/book/${slug}?id=${book?.detail?._id}`);
    };

    const convertSlug = (str) => {
        if (!str) return '';
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

    const handleDeleteBook = (e, book) => {
        e.stopPropagation();
        dispatch(doDeleteBookAction(book._id));
        message.success('Đã xóa truyện khỏi thư viện');
    };

    let items = [
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => setShowManageAccount(true)}
            >Quản lý tài khoản</label>,
            key: 'account',
        },
        {
            label: <Link to="/history">Lịch sử đọc truyện</Link>,
            key: 'history',
        },
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => handleLogout()}
            >Đăng xuất</label>,
            key: 'logout',
        },

    ];
    if (user?.role === 'ADMIN') {
        items.unshift({
            label: <Link to='/admin'>Trang quản trị</Link>,
            key: 'admin',
        })
    }

    const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user?.avatar}`;

    const contentPopover = () => {
        return (
            <div className='pop-cart-body'>
                <div className='pop-cart-content'>
                    {carts?.length > 0 ? (
                        carts.map((book, index) => {
                            return (
                                <div 
                                    className='book' 
                                    key={`book-${index}`}
                                    onClick={() => handleViewBookDetail(book)}
                                >
                                    <img 
                                        src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${book?.detail?.thumbnail}`} 
                                        alt={book?.detail?.mainText}
                                    />
                                    <div className='book-content'>
                                        <div className='title'>{book?.detail?.mainText}</div>
                                        <div className='author'>{book?.detail?.author}</div>
                                        <div className='action-buttons'>
                                            <Button 
                                                type="link" 
                                                icon={<RightOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewBookDetail(book);
                                                }}
                                            >
                                                Xem chi tiết
                                            </Button>
                                            <Button
                                                type="link"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={(e) => handleDeleteBook(e, book)}
                                            >
                                                Xóa
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <Empty description="Không có truyện trong thư viện" />
                    )}
                </div>
            </div>
        )
    }
    return (
        <>
            <div className='header-container'>
                <header className="page-header">
                    <div className="page-header__top">
                        <div className="page-header__toggle" onClick={() => {
                            setOpenDrawer(true)
                        }}>☰</div>
                        <div className='page-header__logo'>
                            <span className='logo'>
                                <span onClick={() => navigate('/')}> <FaReact className='rotate icon-react' />HTH</span>

                                <VscSearchFuzzy className='icon-search' />
                            </span>
                            <input
                                className="input-search" type={'text'}
                                placeholder="Bạn tìm gì hôm nay"
                                value={props.searchTerm}
                                onChange={(e) => props.setSearchTerm(e.target.value)}
                            />
                        </div>

                    </div>
                    <nav className="page-header__bottom">
                        <ul id="navigation" className="navigation">
                            <li className="navigation__item">
                                <Popover
                                    className="popover-carts"
                                    placement="topRight"
                                    rootClassName="popover-carts"
                                    title={"Thư Viện của tôi"}
                                    content={contentPopover}
                                    arrow={true}>
                                    <Badge
                                        count={carts?.length ?? 0}
                                        size={"small"}
                                        showZero
                                    >
                                        <FaBook  className='icon-cart' />
                                    </Badge>
                                </Popover>
                            </li>
                            <li className="navigation__item mobile"><Divider type='vertical' /></li>
                            <li className="navigation__item mobile">
                                {!isAuthenticated ?
                                    <span onClick={() => navigate('/login')}> Tài Khoản</span>
                                    :
                                    <Dropdown menu={{ items }} trigger={['click']}>
                                        <Space >
                                            <Avatar src={urlAvatar} />
                                            {user?.fullName}
                                        </Space>
                                    </Dropdown>
                                }
                            </li>
                        </ul>
                    </nav>
                </header>
            </div>
            <Drawer
                title="Menu chức năng"
                placement="left"
                onClose={() => setOpenDrawer(false)}
                open={openDrawer}
            >
                <p>Quản lý tài khoản</p>
                <Divider />

                <p>Đăng xuất</p>
                <Divider />
            </Drawer>
            <ManageAccount
                isModalOpen={showManageAccount}
                setIsModalOpen={setShowManageAccount}
            />
        </>
    )
};

export default Header;
