import React, { Component } from 'react';
import { DatePicker, Card, Row, Col, Icon, Drawer, Button, Form, Input, InputNumber, Select, Empty, message, Statistic } from 'antd';
import moment from 'moment';
import { CurrencyFormat } from 'common';
import { ApiPost } from 'common/Api';
const { Option } = Select;
const monthFormat = 'MM/DD/YYYY';

class DataPage extends Component {
  getData = () => {
    ApiPost('data-list', { today: this.props.today }).then(res => {
      const income = res.data.filter(f => f.type === true)
      const expense = res.data.filter(f => f.type === false)
      this.setState({
        data: res.data,
        income: income.length > 1 ? income.reduce((a, b) => a + b.price, 0) : income.length === 1 ? income[0].price : 0,
        expense: expense.length > 1 ? expense.reduce((a, b) => a + b.price, 0) : expense.length === 1 ? expense[0].price : 0
      })
    })
  }
  removeData = (_id) => {
    ApiPost('data-remove', { _id }).then(res => {
      res.status === 200 ? message.success('Data Remove Success') : message.error('Data Remove Fail')
      this.getData()
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        ApiPost('data-add', { values }).then(res => {
          res.status === 200 ? message.success('Data Add Success') : message.error('Data Add Fail')
          this.getData()
          this.onClose()
        })
      }
    });
  }
  showDrawer = () => {
    this.setState({
      visible: true,
    })
  }
  onClose = () => {
    this.setState({
      visible: false,
    })
  }
  state = {
    data: [],
    visible: false,
    income: [],
    expense: [],
    getData: this.getData,
    removeData: this.removeData,
    showDrawer: this.showDrawer,
    handleSubmit: this.handleSubmit,
    onClose: this.onClose,
  }
  componentDidMount() {
    this.getData()
  }
  componentDidUpdate(prevProps, prevState) {
    if (moment(prevProps.today).month() !== moment(this.props.today).month()) {
      this.getData()
    }
  }
  render() {
    const { getFieldDecorator } = this.props.form
    const {
      data,
      removeData,
      income,
      expense,
      visible,
      showDrawer,
      handleSubmit,
      onClose
    } = this.state
    const {
      categoryData,
      today,
      changeDate,
    } = this.props
    return (
      <div className="drawer">
        <div className="alignLeft">
          <Button type="primary" onClick={showDrawer}>Add</Button>
        </div>
        <div className="totalForm alignLeft bold">
          <Statistic title="Income" value={income} precision={2} valueStyle={{ color: 'green' }} prefix="$" />
          <Statistic title="Expense" value={expense} precision={2} valueStyle={{ color: 'red' }} prefix="$" />
          <Statistic title="Change" value={expense > 0 || income > 0 ? ((income - expense) / expense) * 100 : 0} precision={2} valueStyle={{ color: 'gold' }} suffix="%" />
        </div>
        <Drawer
          width={400}
          title="Create a new data"
          onClose={onClose}
          visible={visible}
        >
          <Form layout="vertical" hideRequiredMark onSubmit={handleSubmit}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="Title">
                  {getFieldDecorator('title', {
                    rules: [{ required: true, message: 'Please enter the title' }],
                  })(<Input placeholder="Please enter the title" />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Price">
                  {getFieldDecorator('price', {
                    rules: [{ required: true, message: 'Please enter the price' }],
                  })(<InputNumber formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} placeholder="Please enter the price" />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Type">
                  {getFieldDecorator('type', {
                    rules: [{ required: true, message: 'Please select the type' }],
                    initialValue: 0
                  })(
                    <Select placeholder="Please select the type">
                      <Option value={0}>Expense</Option>
                      <Option value={1}>Income</Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="Category">
                  {getFieldDecorator('category', {
                    rules: [{ required: true, message: 'Please select the category' }],
                  })(
                    <Select placeholder="Please select the category">
                      {categoryData.length > 0 ? categoryData.map((m, i) => {
                        return (
                          <Option value={m._id} key={i}>{m.title}</Option>
                        )
                      }) : ''}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="Date">
                  {getFieldDecorator('lastUpdate', {
                    rules: [{ required: true, message: 'Please choose the date' }],
                    initialValue: moment(today, monthFormat)
                  })(
                    <DatePicker format={monthFormat} onChange={(date) => { changeDate(date) }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              Cancel
                </Button>
            <Button type="primary" htmlType="submit">
              Submit
                </Button>
          </Form>
        </Drawer>
        <Card className="dataList">
          {data.length > 0 ?
            data.map((m, i) => {
              return (
                <Card.Grid className="card" key={i}>
                  <Col span={12}><h4 className="alignLeft"><Icon type="close-square" style={{ fontSize: '2em' }} onClick={() => { removeData(m._id) }} /></h4></Col>
                  <Col span={12}><h2>{moment(m.lastUpdate).format(monthFormat)}</h2></Col>
                  <Col span={24}><h1 className={m.type ? 'plus' : 'minus'}>{m.type ? '+' : '-'}<CurrencyFormat price={m.price} digit={2} /></h1></Col>
                  <Col span={24}><h3>{categoryData.length > 0 && categoryData.filter(f => f._id === m.category)[0] ? categoryData.filter(f => f._id === m.category)[0].title : 'None'}</h3></Col>
                  <Col span={24}><h2 className="title alignLeft">{m.title}</h2></Col>
                </Card.Grid>
              )
            })
            :
            <Empty />
          }
        </Card>
      </div>
    );
  }
}

export default Form.create()(DataPage);