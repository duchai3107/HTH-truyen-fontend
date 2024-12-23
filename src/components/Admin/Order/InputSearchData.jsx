import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, theme, notification } from 'antd';

const InputSearchData = (props) => {
    const { token } = theme.useToken();
    const [form] = Form.useForm();
    const [searchValue, setSearchValue] = useState({
        mainText: '',
        author: '',
        category: ''
    });

    const formStyle = {
        maxWidth: 'none',
        background: token.colorFillAlter,
        borderRadius: token.borderRadiusLG,
        padding: 24,
    };

    const onFinish = (values) => {
        let query = "";
        if (values.mainText) {
            query += `&mainText=/${values.mainText}/i`
        }
        if (values.author) {
            query += `&author=/${values.author}/i`
        }
        if (values.category) {
            query += `&category=/${values.category}/i`
        }

        if (query) {
            props.handleSearch(query);
        } else {
            notification.warning({
                message: 'Thông báo',
                description: 'Vui lòng nhập tên truyện hoặc tác giả hoặc thể loại để tìm kiếm',
                duration: 3,
                key: 'search_notification' // Thêm key để tránh hiện nhiều notification
            });
        }
    };

    const handleInputChange = (e, field) => {
        const value = e.target.value;
        setSearchValue(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleClear = () => {
        form.resetFields();
        setSearchValue({
            mainText: '',
            author: '',
            category: ''
        });
        props.setFilter("");
    };

    return (
        <Form form={form} name="advanced_search" style={formStyle} onFinish={onFinish}>
            <Row gutter={24}>
                <Col span={8}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        name={`mainText`}
                        label={`Tên sách`}
                    >
                        <Input 
                            onChange={(e) => handleInputChange(e, 'mainText')}
                            placeholder="Nhập tên sách để tìm kiếm..."
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        name={`author`}
                        label={`Tác giả`}
                    >
                        <Input 
                            onChange={(e) => handleInputChange(e, 'author')}
                            placeholder="Nhập tên tác giả để tìm kiếm..."
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        name={`category`}
                        label={`Thể loại`}
                    >
                        <Input 
                            onChange={(e) => handleInputChange(e, 'category')}
                            placeholder="Nhập thể loại để tìm kiếm..."
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={24} style={{ textAlign: 'right' }}>
                    <Button 
                        type="primary" 
                        htmlType="submit"
                        onClick={() => {
                            if (!searchValue.mainText && !searchValue.author && !searchValue.category) {
                                notification.warning({
                                    message: 'Thông báo',
                                    description: 'Vui lòng nhập tên truyện hoặc tác giả hoặc thể loại để tìm kiếm',
                                    duration: 3,
                                    key: 'search_notification'
                                });
                            }
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        style={{ margin: '0 8px' }}
                        onClick={handleClear}
                    >
                        Clear
                    </Button>
                </Col>
            </Row>
        </Form>
    );
};

export default InputSearchData;