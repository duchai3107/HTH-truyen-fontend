import React, { useEffect, useState } from 'react';
import { Col, Form, Input, message, Modal, notification, Row, Upload, Button } from 'antd';
import { callUpdateBook, callFetchBookById, callUploadBookImg, callResetSlider } from '../../../services/api';
import { LoadingOutlined, PlusOutlined, FilePdfOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';

const Databookupdate = (props) => {
    const { openModalUpdate, setOpenModalUpdate, dataUpdate, setDataUpdate, fetchBook } = props;
    const [isSubmit, setIsSubmit] = useState(false);
    const [form] = Form.useForm();
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [extractedImages, setExtractedImages] = useState([]);
    const [initForm, setInitForm] = useState(null);

    useEffect(() => {
        if (dataUpdate?._id) {
            const init = {
                _id: dataUpdate._id,
                mainText: dataUpdate.mainText,
            }
            setInitForm(init);
            form.setFieldsValue(init);

            // Chỉ lấy tên file từ slider
            if (dataUpdate.slider && Array.isArray(dataUpdate.slider)) {
                setExtractedImages(dataUpdate.slider.map(item => ({
                    name: typeof item === 'string' ? item : item.name,
                    uid: uuidv4()
                })));
            }
        }
    }, [dataUpdate]);

    const extractImagesFromPDF = async (arrayBuffer) => {
        try {
            if (!window.pdfjsLib) {
                throw new Error('PDF.js chưa được load');
            }

            const loadingTask = window.pdfjsLib.getDocument({data: arrayBuffer});
            const pdf = await loadingTask.promise;
            const extractedImages = [];

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                try {
                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({scale: 1.0});
                    
                    // Create canvas
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    // Render PDF page to canvas
                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise;

                    // Convert canvas to blob
                    const blob = await new Promise(resolve => {
                        canvas.toBlob(resolve, 'image/jpeg', 0.75);
                    });

                    // Create File object
                    const file = new File([blob], `page_${pageNum}.jpg`, {
                        type: 'image/jpeg'
                    });

                    // Upload image to server
                    const uploadRes = await callUploadBookImg(file);
                    if (uploadRes?.data?.fileUploaded) {
                        const newImage = {
                            name: uploadRes.data.fileUploaded,
                            uid: uuidv4(),
                            pageNum: pageNum
                        };
                        
                        extractedImages.push(newImage);
                        setExtractedImages(prev => [...prev, newImage]);
                        message.success(`Đã upload trang ${pageNum} thành công`);
                    }

                } catch (error) {
                    console.error(`Lỗi khi xử lý trang ${pageNum}:`, error);
                    message.error(`Không thể xử lý trang ${pageNum}`);
                }
            }

            return extractedImages;

        } catch (error) {
            console.error('Lỗi khi đọc PDF:', error);
            message.error('Không thể đọc file PDF');
            return [];
        }
    };

    const beforeUpload = (file) => {
        const isPDF = file.type === 'application/pdf';
        if (!isPDF) {
            message.error('Chỉ chấp nhận file PDF!');
            return false;
        }
        const isLt10M = file.size / 1024 / 1024 < 50;
        if (!isLt10M) {
            message.error('File phải nhỏ hơn 50MB!');
            return false;
        }

        setLoadingPdf(true);
        // Đọc và xử lý file PDF
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const arrayBuffer = reader.result;
                await extractImagesFromPDF(arrayBuffer);
            } catch (error) {
                message.error('Có lỗi khi xử lý file PDF');
                console.error(error);
            } finally {
                setLoadingPdf(false);
            }
        };
        reader.readAsArrayBuffer(file);

        return false; // Prevent default upload behavior
    };

    const onFinish = async (values) => {
        if (!values._id) {
            notification.error({
                message: 'Lỗi',
                description: 'Không tìm thấy ID sách',
                duration: 3
            });
            return;
        }

        if (extractedImages.length === 0) {
            notification.warning({
                message: 'Thông báo',
                description: 'Vui lòng upload file PDF trước khi cập nhật',
                duration: 3,
                key: 'upload_notification'
            });
            return;
        }

        setIsSubmit(true);
        try {
            // Chỉ gửi mảng tên file
            const formattedImages = extractedImages.map(img => img.name);

            const res = await callUpdateBook(
                values._id,
                dataUpdate.thumbnail,
                formattedImages,
                dataUpdate.mainText,
                dataUpdate.author,
                dataUpdate.price,
                dataUpdate.sold,
                dataUpdate.quantity,
                dataUpdate.category
            );

            if (res?.data) {
                message.success('Cập nhật thành công!');
                setOpenModalUpdate(false);
                await fetchBook();
            } else {
                notification.error({
                    message: 'Đã có lỗi xảy ra',
                    description: res.message,
                    duration: 3
                });
            }
        } catch (error) {
            notification.error({
                message: 'Đã có lỗi xảy ra',
                description: error.message,
                duration: 3
            });
        }
        setIsSubmit(false);
    };

    const handleRemoveImage = (uid) => {
        setExtractedImages(prev => prev.filter(img => img.uid !== uid));
    };

    const handleResetSlider = async () => {
        const bookId = form.getFieldValue('_id');
        if (!bookId) {
            message.error('Không tìm thấy ID sách');
            return;
        }

        try {
            const res = await callResetSlider(bookId);
            if (res?.data) {
                setExtractedImages([]); // Reset local state
                message.success('Reset slider thành công');
                // Refresh book data if needed
                if (typeof fetchBook === 'function') {
                    await fetchBook();
                }
            }
        } catch (error) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error.message || 'Không thể reset slider'
            });
        }
    };

    return (
        <Modal
            title="Thêm nội dung truyện"
            open={openModalUpdate}
            onOk={() => {
                if (extractedImages.length === 0) {
                    notification.warning({
                        message: 'Thông báo',
                        description: 'Vui lòng upload file PDF trước khi cập nhật',
                        duration: 3,
                        key: 'upload_notification'
                    });
                    return;
                }
                form.submit();
            }}
            onCancel={() => {
                form.resetFields();
                setExtractedImages([]);
                setInitForm(null);
                setDataUpdate(null);
                setOpenModalUpdate(false);
            }}
            okText="Cập nhật"
            cancelText="Hủy"
            confirmLoading={isSubmit}
            width="50vw"
            maskClosable={false}
        >
            <Form form={form} onFinish={onFinish} autoComplete="off">
                <Row gutter={15}>
                    <Col hidden>
                        <Form.Item hidden name="_id">
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item
                            label="Tên Truyện"
                            name="mainText"
                            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                        >
                            <Input disabled />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Upload
                                accept=".pdf"
                                beforeUpload={beforeUpload}
                                showUploadList={false}
                            >
                                <Button 
                                    icon={loadingPdf ? <LoadingOutlined /> : <PlusOutlined />}
                                    loading={loadingPdf}
                                >
                                    Chọn file PDF
                                </Button>
                            </Upload>
                            <Button 
                                icon={<ReloadOutlined />}
                                onClick={handleResetSlider}
                                title="Reset slider"
                            />
                        </div>

                        {extractedImages.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                                <h4>Ảnh đã trích xuất ({extractedImages.length})</h4>
                                <div style={{ 
                                    maxHeight: '200px', 
                                    overflowY: 'auto',
                                    border: '1px solid #d9d9d9',
                                    borderRadius: '4px',
                                    padding: '8px'
                                }}>
                                    {extractedImages.map((image) => (
                                        <div
                                            key={image.uid}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '8px',
                                                marginBottom: '8px',
                                                background: '#fafafa',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            <span>
                                                <FilePdfOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                                {image.name}
                                            </span>
                                            <DeleteOutlined
                                                onClick={() => handleRemoveImage(image.uid)}
                                                style={{ color: '#ff4d4f', cursor: 'pointer' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default Databookupdate;