import 'antd/dist/antd.css';
import React, { Component } from 'react';
import {
  List, Alert, Avatar, Spin, Icon, Input, Button, Modal, notification,
} from 'antd';
import {
  sortableContainer,
  sortableElement,
} from 'react-sortable-hoc';

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

const openNotification = (title, type = 'error') => {
  notification[type]({
    message: title,
  });
};

const SortableItem = sortableElement(({
  item, hoverRadio, onHover, onLeave, onEdit, onDelete,
}) => (
  <List.Item
    onMouseEnter={onHover}
    onMouseLeave={onLeave}
    style={hoverRadio !== item.name ? { padding: '5px' } : { padding: '5px', backgroundColor: '#dedede' }}
  >
    <Avatar
      alt="radio"
      style={{
        marginRight: 10,
        pointerEvents: 'none',
        userDrag: 'none',
        userSelect: 'none',
        MozUserSelect: 'none',
        WebkitUserDrag: 'none',
        WebkitUserSelect: 'none',
        MsUserSelect: 'none',
      }}
      src="radio.png"
    />
    <List.Item.Meta
      style={{
        marginRight: 10,
        pointerEvents: 'none',
        userDrag: 'none',
        userSelect: 'none',
        MozUserSelect: 'none',
        WebkitUserDrag: 'none',
        WebkitUserSelect: 'none',
        MsUserSelect: 'none',
      }}
      title={item.name}
      description={item.url}
    />
    {hoverRadio !== item.name ? null
      : (
        <div>
          <Button
            type="primary"
            title="Editer"
            onClick={onEdit}
          >
            <Icon type="edit" theme="filled" />
          </Button>
          {' '}
          <Button
            title="Supprimer"
            type="danger"
            onClick={onDelete}
          >
            <Icon type="delete" theme="filled" />
          </Button>
        </div>
      )}
  </List.Item>
));

const SortableContainer = sortableContainer(({ children }) => <List itemLayout="horizontal">{children}</List>);
export default class App extends Component {
  constructor() {
    super();
    this.state = {
      radios: null,
      addingRadio: false,
      editingRadio: null,
      deletingRadio: null,
      hoverRadio: null,
      tempName: '',
      tempUrl: '',
    };
  }

  componentDidMount() {
    this.refresh();
  }

  addRadio = (name, url) => {
    this.setState({ tempName: '', tempUrl: '' });
    const data = { name, url };
    fetch('http://localhost:8888/api/radios', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.error === 'DUPLICATE_NAME') {
          openNotification('Une radio portant le même nom existe déjà!');
        } else {
          openNotification('Radio ajoutée!', 'success');
        }
        this.refresh();
      });
  }

  editRadio = (oldName, newName, newUrl) => {
    const data = { oldName, newName, newUrl };
    fetch('http://localhost:8888/api/radios', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.error === 'NO_RADIO') {
          openNotification('Cette radio n\'existe pas!');
        } else if (json.error === 'DUPLICATE_NAME') {
          openNotification('Une radio portant le même nom existe déjà!');
        } else {
          openNotification('Radio editée!', 'success');
        }
        this.refresh();
      });
  }

  sortRadio = (name, newIndex) => {
    const data = { name, newIndex };
    fetch('http://localhost:8888/api/radios', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.error === 'NO_RADIO') {
          openNotification('Cette radio n\'existe pas!');
        } else {
          openNotification('Radios réordonnées!', 'success');
        }
        this.refresh();
      });
  }

  deleteRadio = (name) => {
    const data = { name };
    fetch('http://localhost:8888/api/radios', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.error === 'NO_RADIO') {
          openNotification('Cette radio n\'existe pas!');
        } else {
          openNotification('Radio supprimée!', 'success');
        }
        this.refresh();
      });
  }

  refresh() {
    this.setState({
      radios: null,
      addingRadio: false,
      editingRadio: null,
      deletingRadio: null,
    }, () => {
      fetch('api/radios')
        .then((res) => res.json())
        .then((radios) => this.setState({ radios: radios.radios }));
    });
  }

  render() {
    const {
      radios,
      addingRadio,
      editingRadio,
      deletingRadio,
      hoverRadio,
      tempName,
      tempUrl,
    } = this.state;
    return (
      <div style={{ textAlign: 'center' }}>
        <h1>PiWebRadio</h1>
        {radios === null ? <Spin indicator={antIcon} /> : (
          <div style={{
            textAlign: 'left',
            width: '80%',
            margin: 'auto',
          }}
          >
            <Button
              type="primary"
              style={{ backgroundColor: 'green' }}
              onClick={() => this.setState({ addingRadio: true })}
            >
              <Icon type="plus-circle" />
              {' '}
  Ajouter une radio
            </Button>
            <br />
            <br />
            <SortableContainer
              onSortEnd={(
                { oldIndex, newIndex },
              ) => this.sortRadio(radios[oldIndex].name, newIndex)}
            >
              {radios.map((radio, index) => (
                <SortableItem
                  hoverRadio={hoverRadio}
                  onHover={() => this.setState({ hoverRadio: radio.name })}
                  onLeave={() => this.setState({ hoverRadio: null })}
                  onEdit={() => this.setState({
                    tempName: radio.name,
                    tempUrl: radio.url,
                    editingRadio: radio.name,
                    hoverRadio: null,
                  })}
                  onDelete={() => this.setState({
                    deletingRadio: radio.name,
                    hoverRadio: null,
                  })}
                  key={`item-${radio.name}`}
                  index={index}
                  item={radio}
                />
              ))}
            </SortableContainer>

          </div>
        )}
        <Modal
          title="Ajouter une radio"
          visible={addingRadio}
          okButtonProps={{
            disabled: tempName.length === 0 || tempUrl.length === 0,
          }}
          onOk={() => this.addRadio(tempName, tempUrl)}
          onCancel={() => this.setState({ addingRadio: false })}
        >
          {(tempName.length > 0 && tempUrl.length > 0) ? null : (
            <Alert
              message={tempName.length === 0 ? 'Vous devez entrer un nom pour la radio' : 'Vous devez entrer une adresse pour la radio'}
              type="warning"
            />
          )}
          <Input
            placeholder="Nom de la radio"
            max="12"
            min="1"
            value={tempName}
            onChange={(e) => this.setState({ tempName: e.target.value })}
          />
          <Input
            placeholder="Adresse de la radio"
            min="1"
            value={tempUrl}
            onChange={(e) => this.setState({ tempUrl: e.target.value })}
          />
        </Modal>
        <Modal
          title="Editer une radio"
          visible={editingRadio !== null}
          okButtonProps={{
            disabled: tempName.length === 0 || tempUrl.length === 0,
          }}
          onOk={() => this.editRadio(editingRadio, tempName, tempUrl)}
          onCancel={() => this.setState({ editingRadio: null, tempName: '', tempUrl: '' })}
        >
          {(tempName.length > 0 && tempUrl.length > 0) ? null : (
            <Alert
              message={tempName.length === 0 ? 'Vous devez entrer un nom pour la radio' : 'Vous devez entrer une adresse pour la radio'}
              type="warning"
            />
          )}
          <Input
            placeholder="Nom de la radio"
            max="12"
            min="1"
            value={tempName}
            onChange={(e) => this.setState({ tempName: e.target.value })}
          />
          <Input
            placeholder="Adresse de la radio"
            min="1"
            value={tempUrl}
            onChange={(e) => this.setState({ tempUrl: e.target.value })}
          />
        </Modal>
        <Modal
          title="Supprimer une radio"
          visible={deletingRadio !== null}
          onOk={() => this.deleteRadio(deletingRadio)}
          onCancel={() => this.setState({ deletingRadio: null })}
        >
          <h1>{`Supprimer la radio ${deletingRadio}?`}</h1>
        </Modal>
      </div>
    );
  }
}
