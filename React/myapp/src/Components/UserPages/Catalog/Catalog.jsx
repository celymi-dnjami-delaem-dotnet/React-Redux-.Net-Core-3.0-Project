import React from 'react';
import '../Catalog/Catalog.css';
import { axiosGet, axiosPost } from '../../CommonFunctions/axioses';
import { GETCURRENTPLATFORMGAMES } from '../../CommonFunctions/URLconstants';
import GameBlockInfo from './GameBlockInfo';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import { ORDERGAMES, GETGAMESBYREGEX } from '../../CommonFunctions/URLconstants';
import { search } from 'react-icons-kit/fa/search';
import { Icon } from 'react-icons-kit';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

class Catalog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            games: [],
            orderingType1: 'Name',
            orderingType2: 'Asc'
        }
    }

    componentDidMount() {
        (async () => {
            let res = await axiosGet(GETCURRENTPLATFORMGAMES + this.props.match.params.gamePlatform);
            if (res.status === 200) {
                this.setState({ games: res.data });
            }
        })()
    }

    componentDidUpdate(preProps, preState) {
        if (this.props.match.params.gamePlatform !== preProps.match.params.gamePlatform) {
            (async () => {
                let res = await axiosGet(GETCURRENTPLATFORMGAMES + this.props.match.params.gamePlatform);
                if (res.status === 200) {
                    this.setState({ games: res.data });
                }
            })()
        }
        if (this.state.orderingType1 !== preState.orderingType1 || this.state.orderingType2 !== preState.orderingType2) {
            (async () => {
                let temp = this.state.orderingType1 + this.state.orderingType2;
                let res = await axiosPost(ORDERGAMES, { GamePlatform: this.props.match.params.gamePlatform, Type: temp });
                if (res.status === 200) {
                    this.setState({ games: res.data });
                }
            })()
        }
    }

    setOrderType1 = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    getGamesByRating = async (e) => {
        let res = await axiosGet(ORDERGAMES + `GamePlatform=${this.props.match.params.gamePlatform}&Type=Rating&TypeValue=${e.target.value}%2B`);
        if (res.status == 200) {
            this.setState({ games: res.data });
        }
    }

    getGamesByGenres = async (e) => {
        let res = await axiosPost(ORDERGAMES, { GamePlatform: this.props.match.params.gamePlatform, Type: 'Genre', TypeValue: e.target.value });
        if (res.status == 200) {
            this.setState({ games: res.data });
        }
    }

    getGamesByRegex = async (e) => {
        let res = await axiosGet(GETGAMESBYREGEX + `GamePlatform=${this.props.match.params.gamePlatform}&GameName=${e.target.value}`);
        if (res.status === 200) {
            this.setState({ games: res.data });
        }
    }

    render() {
        return (
            <div id="divMainCatalog">
                <div id="divMainCatalog_Options">
                    <h2 style={{ marginTop: '15px' }}>{this.props.match.params.gamePlatform}</h2>
                    <div id="divMainCatalog_Options_Selects">
                        <h4 style={{ marginLeft: '40px', marginTop: '10px' }}>Сортировка:</h4>
                        <div className="divContainer_Sort">
                            <label>Критерий:</label>
                            <select className="Selects" style={{ width: '100px' }} onChange={this.setOrderType1} name="orderingType1">
                                <option value="Name">Имя</option>
                                <option value="Price">Цена</option>
                                <option value="Score">Рейтинг</option>
                            </select>
                        </div>
                        <div className="divContainer_Sort">
                            <label>Тип:</label>
                            <select className="Selects" onChange={this.setOrderType1} name="orderingType2">
                                <option value="Asc">По возрастанию</option>
                                <option value="Desc">По убыванию</option>
                            </select>
                        </div>
                    </div>
                    <div id="divMainCatalog_Options_Radios">
                        <h4 style={{ marginLeft: '40px' }}>Жанры:</h4>
                        <ul>
                            <li className="liStyles" >
                                <input type="radio" name="jenres" value="All" defaultChecked onChange={this.getGamesByGenres} />Все
                            </li>
                            <li className="liStyles" >
                                <input type="radio" name="jenres" value="Shooter" onChange={this.getGamesByGenres} />Shooter
                            </li>
                            <li className="liStyles" >
                                <input type="radio" name="jenres" value="Strategy" onChange={this.getGamesByGenres} />Strategy
                            </li>
                            <li className="liStyles" >
                                <input type="radio" name="jenres" value="Racing" onChange={this.getGamesByGenres} />Racing
                            </li>
                            <li className="liStyles" >
                                <input type="radio" name="jenres" value="Fighting" onChange={this.getGamesByGenres} />Fighting
                            </li>
                        </ul>
                    </div>
                    <div id="divMainCatalog_Options_Radios">
                        <h4 style={{ marginLeft: '40px' }}>Возраст:</h4>
                        <ul>
                            <li className="liStyles" >
                                <input type="radio" name="rating" value="All" defaultChecked onChange={this.getGamesByRating} />Все
                            </li>
                            <li className="liStyles" >
                                <input type="radio" name="rating" value="6" onChange={this.getGamesByRating} />6+
                            </li>
                            <li className="liStyles" >
                                <input type="radio" name="rating" value="12" onChange={this.getGamesByRating} />12+
                            </li>
                            <li className="liStyles" >
                                <input type="radio" name="rating" value="18" onChange={this.getGamesByRating} />18+
                            </li>
                        </ul>
                    </div>
                </div>
                <div id="divMainCatalog_Games">
                    <div>
                        <InputGroup style={{ marginTop: '20px', marginBottom: '20px', marginLeft: '30px', width: '30em' }}>
                            <InputGroup.Prepend>
                                <InputGroup.Text id="btnGroupAddon">
                                    <Icon icon={search} size={18} />
                                </InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl
                                type="text"
                                placeholder="Введите название"
                                aria-label="Input group example"
                                onChange={this.getGamesByRegex}
                            />
                        </InputGroup>
                    </div>
                    <div id="divMainCatalog_Games_GameBlockInfo">
                        <Container>
                            <Row className="bootstrap_RowCatalog">
                                {this.state.games.map((x) => {
                                    return (
                                        <Col md={2}>
                                            <GameBlockInfo
                                                gameID={x.gameID}
                                                gameName={x.gameName}
                                                gameJenre={x.gameJenre}
                                                gamePrice={x.gamePrice}
                                                gameRating={x.gameRating}
                                                gameScore={x.gameScore}
                                                gamePlatform={this.props.match.params.gamePlatform}
                                                gameImage={x.gameImage}
                                            />
                                        </Col>
                                    );
                                })}
                            </Row>
                        </Container>
                    </div>
                </div>
            </div>
        );
    }
}

export default Catalog;