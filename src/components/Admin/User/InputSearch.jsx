import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, theme, notification } from 'antd';

const InputSearch = (props) => {
    const { token } = theme.useToken();
    const [form] = Form.useForm();
    const [searchValue, setSearchValue] = useState({ fullName: '', email: '' });

    const formStyle = {
        maxWidth: 'none',
        background: token.colorFillAlter,
        borderRadius: token.borderRadiusLG,
        padding: 24,
    };

    const onFinish = (values) => {
        let query = "";
        if (values.fullName) {
            query += `&fullName=/${values.fullName}/i`
        }
        if (values.email) {
            query += `&email=/${values.email}/i`
        }
        if (values.phone) {
            query += `&phone=/${values.phone}/i`
        }

        if (query) {
            props.handleSearch(query);
        } else {
            notification.warning({
                message: 'Thông báo',
                description: 'Vui lòng nhập email hoặc tên để tìm kiếm',
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
        setSearchValue({ fullName: '', email: '' });
        props.setFilter("");
    };

    return (
        <Form form={form} name="advanced_search" style={formStyle} onFinish={onFinish}>
            <Row gutter={24}>
                <Col span={12}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        name={`fullName`}
                        label={`Name`}
                    >
                        <Input 
                            onChange={(e) => handleInputChange(e, 'fullName')}
                            placeholder="Nhập tên để tìm kiếm..."
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        name={`email`}
                        label={`Email`}
                    >
                        <Input 
                            onChange={(e) => handleInputChange(e, 'email')}
                            placeholder="Nhập email để tìm kiếm..."
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
                            if (!searchValue.email && !searchValue.fullName) {
                                notification.warning({
                                    message: 'Thông báo',
                                    description: 'Vui lòng nhập email hoặc tên để tìm kiếm',
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

export default InputSearch;