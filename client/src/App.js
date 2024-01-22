import React, { Component } from 'react';
import {
  List, Alert, Avatar, Spin, Input, Button, Modal, notification,
} from 'antd';
import {
  sortableContainer,
  sortableElement,
} from 'react-sortable-hoc';
import { LoadingOutlined } from '@ant-design/icons';
import { EditOutlined } from '@ant-design/icons';
import { DeleteOutlined } from '@ant-design/icons';
import { PlusCircleOutlined } from '@ant-design/icons';
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

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
            title="Edit"
            onClick={onEdit}
          >
                        <EditOutlined theme="filled" />
          </Button>
          {' '}
          <Button
            title="Supprimer"
            type="danger"
            onClick={onDelete}
          >
                        <DeleteOutlined theme="filled" />
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
    fetch('api/radios', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.error === 'DUPLICATE_NAME') {
          openNotification('A radio with the same name is already registered!');
        } else {
          openNotification('Added radio!', 'success');
        }
        this.refresh();
      });
  }

  editRadio = (oldName, newName, newUrl) => {
    const data = { oldName, newName, newUrl };
    fetch('api/radios', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.error === 'NO_RADIO') {
          openNotification('This radio does not exist!');
        } else if (json.error === 'DUPLICATE_NAME') {
            openNotification('A radio with the same name is already registered!');
        } else {
          openNotification('Edited radio!', 'success');
        }
        this.refresh();
      });
  }

  sortRadio = (name, newIndex) => {
    const data = { name, newIndex };
    fetch('api/radios', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.error === 'NO_RADIO') {
            openNotification('This radio does not exist!');
        } else {
          openNotification('Reordered radios!', 'success');
        }
        this.refresh();
      });
  }

  deleteRadio = (name) => {
    const data = { name };
    fetch('api/radios', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.error === 'NO_RADIO') {
            openNotification('This radio does not exist!');
        } else {
          openNotification('Removed radio!', 'success');
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
          .then((res) => {
              console.log(res);
            return res.json();
        })
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
          <div>
            <a href="https://doc.ubuntu-fr.org/liste_radio_france" rel="noopener noreferrer" target="_blank">Find a radio</a>
          </div>
            <Button
              type="primary"
              style={{ backgroundColor: 'green' }}
              onClick={() => this.setState({ addingRadio: true })}
            >
              <PlusCircleOutlined />
              {' '}
  Ajouter une radio
            </Button>
            <br />
            <br />
            <SortableContainer
              onSortEnd={(
                { oldIndex, newIndex },
              ) => {if (oldIndex !== newIndex) {
                this.sortRadio(radios[oldIndex].name, newIndex)
              }}}
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
          title="Add a radio"
          visible={addingRadio}
          okButtonProps={{
            disabled: tempName.length === 0 || tempUrl.length === 0,
          }}
          onOk={() => this.addRadio(tempName, tempUrl)}
          onCancel={() => this.setState({ addingRadio: false })}
        >
          {(tempName.length > 0 && tempUrl.length > 0) ? null : (
            <Alert
                        message={tempName.length === 0 ? 'You must enter a radio name' : 'You must enter a radio url'}
              type="warning"
            />
          )}
          <Input
            placeholder="Radio name"
            max="12"
            min="1"
            value={tempName}
            onChange={(e) => this.setState({ tempName: e.target.value })}
          />
          <Input
            placeholder="Radio URL"
            min="1"
            value={tempUrl}
            onChange={(e) => this.setState({ tempUrl: e.target.value })}
          />
        </Modal>
        <Modal
          title="Edit a radio"
          visible={editingRadio !== null}
          okButtonProps={{
            disabled: tempName.length === 0 || tempUrl.length === 0,
          }}
          onOk={() => this.editRadio(editingRadio, tempName, tempUrl)}
          onCancel={() => this.setState({ editingRadio: null, tempName: '', tempUrl: '' })}
        >
          {(tempName.length > 0 && tempUrl.length > 0) ? null : (
            <Alert
                        message={tempName.length === 0 ? 'You must enter a radio name' : 'You must enter a radio url'}
              type="warning"
            />
          )}
          <Input
            placeholder="Radio name"
            max="12"
            min="1"
            value={tempName}
            onChange={(e) => this.setState({ tempName: e.target.value })}
          />
          <Input
            placeholder="Radio URL"
            min="1"
            value={tempUrl}
            onChange={(e) => this.setState({ tempUrl: e.target.value })}
          />
        </Modal>
        <Modal
          title="Remove a radio"
          visible={deletingRadio !== null}
          onOk={() => this.deleteRadio(deletingRadio)}
          onCancel={() => this.setState({ deletingRadio: null })}
        >
          <h1>{`Remove the radio ${deletingRadio}?`}</h1>
        </Modal>
      </div>
    );
  }
}
