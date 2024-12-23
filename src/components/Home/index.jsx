import { FilterTwoTone, ReloadOutlined, HomeOutlined, UserOutlined } from '@ant-design/icons';
import { Row, Col, Form, Checkbox, Divider, InputNumber, Button, Rate, Tabs, Pagination, Spin, Empty, Breadcrumb, List, Select } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { callFetchCategory, callFetchListBook } from '../../services/api';
import './home.scss';
import MobileFilter from './MobileFilter';
const Home = () => {
    const [searchTerm, setSearchTerm] = useOutletContext();

    const [listCategory, setListCategory] = useState([]);

    const [listBook, setListBook] = useState([]);
    const [topRankingBooks, setTopRankingBooks] = useState([]);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=-sold");

    const [showMobileFilter, setShowMobileFilter] = useState(false);

    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTopRanking = async () => {
            const res = await callFetchListBook("current=1&pageSize=6&sort=-sold");
            if (res && res.data) {
                setTopRankingBooks(res.data.result);
            }
        };
        fetchTopRanking();
    }, []);

    useEffect(() => {
        const initCategory = async () => {
            const res = await callFetchCategory();
            if (res && res.data) {
                const d = res.data.map(item => {
                    return { label: item, value: item }
                })
                setListCategory(d);
            }
        }
        initCategory();
    }, []);

    useEffect(() => {
        fetchBook();
    }, [current, pageSize, filter, sortQuery, searchTerm]);

    const fetchBook = async () => {
        setIsLoading(true)
        let query = `current=${current}&pageSize=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        if (searchTerm) {
            query += `&mainText=/${searchTerm}/i`;
        }

        const res = await callFetchListBook(query);
        if (res && res.data) {
            setListBook(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false)
    }

    const handleOnchangePage = (pagination) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }

    }

    const handleChangeFilter = (changedValues, values) => {
        // console.log(">>> check changedValues, values: ", changedValues, values)

        //only fire if category changes
        if (changedValues.category) {
            const cate = values.category;
            if (cate && cate.length > 0) {
                const f = cate.join(',');
                setFilter(`category=${f}`)
            } else {
                //reset data -> fetch all
                setFilter('');
            }
        }

    }

    const onFinish = (values) => {
        // console.log('>> check values: ', values)

        if (values?.range?.from >= 0 && values?.range?.to >= 0) {
            let f = `price>=${values?.range?.from}&price<=${values?.range?.to}`;
            if (values?.category?.length) {
                const cate = values?.category?.join(',');
                f += `&category=${cate}`
            }
            setFilter(f);
        }
    }

    const items = [
        {
            key: "sort=-sold",
            label: `Phổ biến`,
            children: <></>,
        },
        {
            key: 'sort=-updatedAt',
            label: `Mới Nhất`,
            children: <></>,
        },
    ];

    const nonAccentVietnamese = (str) => {
        str = str.replace(/A|Á|À|Ã|Ạ|Â|Ấ|Ầ|Ẫ|Ậ|Ă|Ắ|Ằ|Ẵ|Ặ/g, "A");
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/E|É|È|Ẽ|Ẹ|Ê|Ế|Ề|Ễ|Ệ/, "E");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/I|Í|Ì|Ĩ|Ị/g, "I");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/O|Ó|Ò|Õ|Ọ|Ô|Ố|Ồ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ỡ|Ợ/g, "O");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/U|Ú|Ù|Ũ|Ụ|Ư|Ứ|Ừ|Ữ|Ự/g, "U");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/Y|Ý|Ỳ|Ỹ|Ỵ/g, "Y");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/Đ/g, "D");
        str = str.replace(/đ/g, "d");
        // Some system encode vietnamese combining accent as individual utf-8 characters
        str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
        str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
        return str;
    }

    const convertSlug = (str) => {
        str = nonAccentVietnamese(str);
        str = str.replace(/^\s+|\s+$/g, ''); // trim
        str = str.toLowerCase();

        // remove accents, swap ñ for n, etc
        const from = "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆĞÍÌÎÏİŇÑÓÖÒÔÕØŘŔŠŞŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇğíìîïıňñóöòôõøðřŕšşťúůüùûýÿžþÞĐđßÆa·/_,:;";
        const to = "AAAAAACCCDEEEEEEEEGIIIIINNOOOOOORRSSTUUUUUYYZaaaaaacccdeeeeeeeegiiiiinnooooooorrsstuuuuuyyzbBDdBAa------";
        for (let i = 0, l = from.length; i < l; i++) {
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }

        str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
            .replace(/\s+/g, '-') // collapse whitespace and replace by -
            .replace(/-+/g, '-'); // collapse dashes

        return str;
    }

    const handleRedirectBook = (book) => {
        const slug = convertSlug(book.mainText);
        navigate(`/book/${slug}?id=${book._id}`)
    }

    const handleReadBook = (bookId) => {
        navigate(`/order/${bookId}`);
    };

    return (
        <div style={{ background: '#efefef', padding: "20px 0" }}>
            <div className="homepage-container" style={{ maxWidth: 1740, margin: '0 auto' }}>
                <Breadcrumb
                    style={{ margin: '5px 0' }}
                    items={[
                        {
                            title: <HomeOutlined />,
                        },
                        {
                            title: (
                                <Link to={'/'}>
                                    <span>Trang Chủ</span>
                                </Link>
                            ),
                        }
                    ]}
                />
                <Row gutter={[20, 20]}>
                    <Col span={24}>
                        <div style={{ padding: "20px", background: '#fff', borderRadius: 5 }}>
                            <Row gutter={[16, 16]} align="middle">
                                <Col xs={24} md={8}>
                                    <Form
                                        form={form}
                                        onValuesChange={(changedValues, values) => handleChangeFilter(changedValues, values)}
                                    >
                                        <Form.Item
                                            name="category"
                                            style={{ marginBottom: 0 }}
                                        >
                                            <Select
                                                mode="multiple"
                                                allowClear
                                                style={{ width: '100%' }}
                                                placeholder="Chọn Thể loại truyện"
                                                options={listCategory}
                                            />
                                        </Form.Item>
                                    </Form>
                                </Col>
                                <Col xs={24} md={16}>
                                    <Tabs
                                        defaultActiveKey="sort=-sold"
                                        items={items}
                                        onChange={(value) => { setSortQuery(value) }}
                                        style={{ marginBottom: 0 }}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Col>

                    <Col md={4} sm={0} xs={0}>
                        <div style={{ padding: "20px", background: '#fff', borderRadius: 5 }}>
                            <div style={{ marginBottom: 20, borderBottom: '1px solid #ddd', paddingBottom: 10 }}>
                                <span style={{ color: '#1890ff', fontWeight: 'bold', fontSize: '16px' }}>
                                    Top Bảng Xếp Hạng
                                </span>
                            </div>
                            <List
                                itemLayout="horizontal"
                                dataSource={topRankingBooks}
                                renderItem={item => (
                                    <List.Item onClick={() => handleRedirectBook(item)} style={{ cursor: 'pointer' }}>
                                        <List.Item.Meta
                                            avatar={
                                                <img 
                                                    src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${item.thumbnail}`} 
                                                    alt={item.mainText} 
                                                    style={{ width: '50px', height: '70px', objectFit: 'cover' }} 
                                                />
                                            }
                                            title={
                                                <div style={{ 
                                                    fontSize: '14px', 
                                                    fontWeight: 500,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }}>
                                                    {item.mainText}
                                                </div>
                                            }
                                            description={
                                                <div style={{ fontSize: '12px' }}>
                                                    {item.author}
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </div>
                    </Col>

                    <Col md={20} xs={24}>
                        <Spin spinning={isLoading} tip="Loading...">
                            <div style={{ padding: "20px", background: '#fff', borderRadius: 5 }}>
                                <Row className='customize-row'>
                                    {listBook?.map((item, index) => {
                                        return (
                                            <div className="column" key={`book-${index}`} onClick={() => handleRedirectBook(item)}>
                                                <div className='wrapper'>
                                                    <div className='thumbnail'>
                                                        <img src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${item.thumbnail}`} alt="thumbnail book" />
                                                    </div>
                                                    <div className='text' title={item.mainText}>{item.mainText}</div>
                                                    <div className='rating'>
                                                        <Rate value={5} disabled style={{ color: '#ffce3d', fontSize: 10 }} />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </Row>
                                <Divider />
                                <Row style={{ display: "flex", justifyContent: "center" }}>
                                    <Pagination
                                        current={current}
                                        pageSize={pageSize}
                                        total={total}
                                        responsive
                                        onChange={(c, ps) => handleOnchangePage({ current: c, pageSize: ps })}
                                    />
                                </Row>
                            </div>
                        </Spin>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default Home;