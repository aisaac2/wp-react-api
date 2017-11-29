import React, {Component} from 'react';

class Header extends React.Component {

  constructor(){
    super();
    this.state = {
      menus:[],
    };
  }

  componentWillMount(){
    fetch('http://dev.YOURSITEURL.com/wp-json/wp/v2/menu')
    .then( results => {
      return results.json();
    }).then( data => {
      let menus = data.map((item) => {
        //console.log(data)
        return (
          <li key={item.ID} className={`menu-item ${item.post_type}`}>
            <a href={item.url}>{item.post_title}</a>
          </li>
        );
      })
      this.setState({menus: menus});
    })
  }

  render() {
    //console.log(this.state.menus)
    return(
      <ul id="menu-primary" className="nav">
        {this.state.menus}
      </ul>
    )

  }
}

ReactDOM.render(<Header/>, document.getElementById('navPrimary'));
  
