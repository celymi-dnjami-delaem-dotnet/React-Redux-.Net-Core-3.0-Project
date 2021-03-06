import React from 'react';
import '../AccountSettings/AccountSettings.scss';
import { axiosGet, axiosPost, axiosDelete, axiosPut } from '../../CommonFunctions/axioses';
import { Image, Transformation } from 'cloudinary-react';
import { GETFULLUSERINFO, UPDATEFEEDBACK, DELETEGAMEMARK, DELETEFEEDBACK, SIGNOUTUSER, UPDATEAVATAR } from '../../CommonFunctions/URLconstants';
import { connect } from 'react-redux';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Table from 'react-bootstrap/Table';
import Moment from 'moment';
import LoadingSpinner from '../../CommonFunctions/LoadingSpinner';
import UserComments from '../AccountSettings/UserComments';
import Button from 'react-bootstrap/Button';
import RatingStars from '../RatingStars/RatingStars';
import store from '../../_REDUX/Storage';
import axios from 'axios';

class AccountSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userInfo: {},
            selectedComment: {
                comment: ''
            },
            showModal: false,
            modalType: '',
            inputFile: undefined
        }
        this.myRef = React.createRef();
    }

    async componentDidMount() {
        let res = await axiosGet(GETFULLUSERINFO + this.props.user.username);
        if (res.status === 200) this.setState({ userInfo: res.data });
    }

    setNewComment = (e) => {
        this.setState({
            selectedComment: {
                ...this.state.selectedComment,
                comment: e.target.value
            }
        });
    }

    getID = (selectedID) => {
        this.state.selectedComment = this.state.userInfo.feedbacks.find((x) => {
            if (x.commentID == selectedID) return x;
        });
        this.setState({ selectedComment: this.state.selectedComment });
    }

    UpdateComment = async () => {
        let res = await axiosPut(UPDATEFEEDBACK, {
            Id: this.state.selectedComment.commentID,
            Username: this.props.user.username,
            GameID: this.state.selectedComment.gameID,
            Comment: this.state.selectedComment.comment
        });
        if (res.status === 200) {
            this.setState({
                userInfo: {
                    ...this.state.userInfo,
                    feedbacks: res.data
                }
            });
        }
    }

    deleteMark = async (e) => {
        let res = await axiosDelete(DELETEGAMEMARK + `Username=${this.props.user.username}&scoreID=${e.target.value}`);
        if (res.status === 200) {
            this.setState({
                userInfo: {
                    ...this.state.userInfo,
                    gameMarks: res.data
                }
            });
        }
    }

    deleteFeedback = async () => {
        let res = await axiosDelete(DELETEFEEDBACK + `Username=${this.props.user.username}&FeedBackID=${this.state.selectedComment.commentID}`);
        if (res.status === 200) {
            this.setState({
                userInfo: {
                    ...this.state.userInfo,
                    feedbacks: res.data
                },
                comment: ''
            });
        }
    }

    changeSettings = async (e) => {
        switch (e.target.name) {
            case 'password': {
                return (store.dispatch({ type: 'SHOW_MODAL', showModal: true, modalType: 'password' }));
            }
            case 'balance': {
                return (store.dispatch({ type: 'SHOW_MODAL', showModal: true, modalType: 'balance' }));
            }
            case 'leave': {
                let res = await axiosDelete(SIGNOUTUSER + this.props.user.username);
                if (res.status === 200) {
                    localStorage.clear();
                    store.dispatch({ type: 'LOGGED_USER', username: 'Войти', userRole: 'User', isLogged: false });
                    this.props.history.push("/");
                }
            }
        }
    }

    selectFile = () => {
        this.setState({ inputFile: this.myRef.current.files[0] });
        let formdata = new FormData();
        formdata.append('file', this.myRef.current.files[0]);
        formdata.append('upload_preset', 'iTechArt');
        axios.post("https://api.cloudinary.com/v1_1/djlynoeio/image/upload", formdata).then(async (response) => {
            await axiosPut(UPDATEAVATAR + `username=${this.props.user.username}&avatarlink=${response.data.public_id}`);
            this.setState({
                userInfo: {
                    ...this.state.userInfo,
                    userImage: response.data.public_id
                }
            })
        });
    }

    selectAvatar = () => {
        this.myRef.current.value = '';
        this.myRef.current.click();
    }

    render() {
        return (
            <div className="divMainAccountSettings">
                <div id="emptyDiv" />
                <div id="UserInfoDiv">
                    <div className="div_UserHeaderInfo">
                        <div className="div_UserAvatar">
                            <Image publicId={this.state.userInfo.userImage} cloudName="djlynoeio" width="210" height="210">
                                <Transformation radius="max" />
                            </Image>
                        </div>
                        <div className="div_UserInfo">
                            <div className="optionsContainer">
                                <div className="userHeader">
                                    <h1>{this.props.user.username}</h1>
                                </div>
                                <div className="buttonsInfo">
                                    <span>Текущий баланс: {this.props.user.userBalance}p</span>
                                    <Button variant="outline-info" size="sm" name="balance" onClick={this.changeSettings}>Пополнить</Button>
                                </div>
                                <div className="buttonsOptions">
                                    <Button variant="outline-primary" className="optButton" name="password" onClick={this.changeSettings}>Изменить пароль</Button>

                                    <Button variant="outline-primary" className="optButton" onClick={this.selectAvatar}>
                                        <input type="file" hidden ref={this.myRef} onChange={this.selectFile} className="optButton" name="avatar" title="Изменить аватар" />
                                        Изменить аватар</Button>
                                    <Button variant="outline-danger" onClick={this.changeSettings} className="leaveButton" name="leave">Выйти</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="div_UserAction">
                        <Tabs defaultActiveKey="orders" id="uncontrolled-tab-example">
                            <Tab eventKey="orders" title="Заказы">
                                {this.state.userInfo.orders && this.state.userInfo.length ?
                                    <Table>
                                        <thead>
                                            <tr>
                                                <th>Название</th>
                                                <th>Платформа</th>
                                                <th>Дата заказа</th>
                                                <th>Количество</th>
                                                <th>Цена</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.userInfo.orders.map((x) => {
                                                return (
                                                    <tr key={x.orderID}>
                                                        <td>{x.gameName}</td>
                                                        <td>{x.gamePlatform}</td>
                                                        <td>{Moment(x.orderDate).format("DD-MM-YYYY")}</td>
                                                        <td>{x.amount}</td>
                                                        <td>{x.totalSum}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                    : <h2>Здесь пусто... пока что</h2>}
                            </Tab>
                            <Tab eventKey="feedback" title="Отзывы">
                                <div className="comments">
                                    {this.state.userInfo.feedbacks && this.state.userInfo.feedbacks.length ? this.state.userInfo.feedbacks.map((x) => {
                                        return (
                                            <UserComments
                                                key={x.commentID}
                                                getID={this.getID}
                                                commentID={x.commentID}
                                                comment={x.comment}
                                                gameName={x.gameName}
                                                gamePlatform={x.gamePlatform}
                                                commentDate={Moment(x.commentDate).format("DD-MM-YYYY")}
                                            />
                                        );
                                    }) : <h2>Здесь пусто... пока что</h2>}
                                </div>
                                <div className="commentsOptions">
                                    <div className="fieldCommentArea">
                                        <textarea onChange={this.setNewComment} value={this.state.selectedComment.comment} className="changedCommentsArea" maxLength={500} />
                                    </div>
                                    <div className="fieldCommentOptions">
                                        <label>{this.state.selectedComment.comment.length}/500</label>
                                        <div className="buttonsContainer">
                                            <Button variant="outline-primary" style={{ marginBottom: '10px' }} onClick={this.UpdateComment}>Сохранить</Button>
                                            <Button variant="outline-danger" onClick={this.deleteFeedback}>Удалить</Button>
                                        </div>
                                    </div>
                                </div>
                            </Tab>
                            <Tab eventKey="marks" title="Оценки">
                                {this.state.userInfo.gameMarks && this.state.userInfo.gameMarks.length ?
                                    <Table>
                                        <thead>
                                            <tr>
                                                <th>Название</th>
                                                <th>Платформа</th>
                                                <th>Оценка</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.userInfo.gameMarks.map((x) => {
                                                return (
                                                    <tr key={x.scoreID}>
                                                        <td>{x.gameName}</td>
                                                        <td>{x.gamePlatform}</td>
                                                        <td>
                                                            <div className="starContainer">
                                                                <RatingStars isItEditable={true} gameScore={x.score} size={26} starColor="orange" />
                                                            </div>
                                                        </td>
                                                        <td><Button variant="outline-danger" size="sm" onClick={this.deleteMark} value={x.scoreID}>Удалить</Button></td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                    : <h2>Здесь пусто... пока что</h2>}
                            </Tab>
                        </Tabs>
                    </div>
                </div>
                <div id="emptyDiv" />
            </div>
        );
    }
}

const mapStateToProps = function (store) {
    return {
        user: store.user
    };
}

export default connect(mapStateToProps)(AccountSettings);