import React, {Component} from 'react';
import {Select2, Input, Check} from '../../../edits';
import Flatten from '../../../../utils/flatten';
import sortBy from 'lodash/sortBy';
import {observer} from 'mobx-react';

class ToolbarPage extends Component {
  static contextTypes = {
    store: React.PropTypes.object
  };

  updateParent(x, v) {
    const {patch} = this.props;

    if (v === null) {
      patch({menu: null, parent: null});
    }
    else if (v === "foot") {
      patch({menu: "foot", parent: null});
    }
    else {
      patch({parent: v});
    }
  }

  updateName(v) {
    const {page, patch} = this.props;

    const oldValue = page.name;
    const value = {
      name: v
    };

    function cleanName(str) {
      if (!str) return null;
      return "/" + str.toLowerCase().trim().split(' ').join('-');
    }

    if (v && (!oldValue || !page.slug || page.slug === cleanName(oldValue))) {
      value.slug = cleanName(v);
    }

    patch(value);
  }

  saveTemplate() {
    const {page, patch} = this.props;
    var name = prompt('Name der Vorlage', '');
    this.context.store.cms.savePageAsTemplate(this.props.page, name).then(template=> {
      patch({templateName: template.template, templateId: template.id, templateData: {}, template: template});
    });
  }

  render() {
    const {page, navigation, templates, patch} = this.props;

    const items = [];
    if (navigation) {
      Flatten(JSON.parse(JSON.stringify(navigation['main']))).forEach(i=>items.push(i));
      Flatten(JSON.parse(JSON.stringify(navigation['foot'] || []))).forEach(i=>items.push(i));
    }
    var pageSelection = sortBy(items.map(function (item) {
      return {value: item.slug, label: item.slug}
    }), (item)=> {
      return item.label;
    });
    pageSelection.splice(0, 0, {label: "Fußleiste", value: "foot"});
    pageSelection.splice(0, 0, {label: "Hauptnavigation", value: null});

    var _templates = Object.keys(templates || {}).map(key=>({label: templates[key].title, value: key, template: key}));
    this.context.store.cms.templates.forEach(x=> {
      _templates.push({label: x.name, value: x.id, template: x.template, persistent: true})
    });

    return (
      <form className="ui form">
        {!page.id ? <h1 className="ui header">
          Neue Seite
          <div className="sub header">
            "Eine neue Seite anlegen."
          </div>
        </h1> : null}
        <div className="field">
          <label>Name</label>
          <Input type="text" className="form-control" required="" value={page.name}
                 updateValue={::this.updateName}/>
        </div>
        <div className="field">
          <label>Übergeordnet</label>
          <Select2 name="form-field-name"
                   value={page.parent || page.menu}
                   labelKey="label"
                   valueKey="value"
                   options={pageSelection}
                   updateValue={::this.updateParent}/>
        </div>
        <div className="field">
          <label>Slug</label>
          <Input type="text" className="form-control" required=""
                 value={"/" + (page.slug || "").split("/")[(page.slug || "").split("/").length-1]}
                 updateValue={(v)=>{patch({slug:(page.slug || "").replace("/" + (page.slug || "").split("/")[(page.slug || "").split("/").length-1], v)})}}/>
        </div>
        <div className="field">
          <label>Beschreibung</label>
          <Input type="text" className="form-control" required="" value={page.description}
                 updateValue={(v)=>patch({description:v})}/>
        </div>
        <div className="field">
          <label>Platzhalter</label>
          <Check className="form-control" value={page.placeholder} updateValue={(v)=>patch({placeholder:v})}/>
        </div>
        <div className="field">
          <label>Vorlage</label>
          <Select2 name="form-field-name"
                   labelKey="label"
                   valueKey="value"
                   value={page['templateId']||page['templateName']||'default'}
                   options={_templates}
                   updateValue={(x, v)=>patch({templateName: x.template, templateId: x.persistent ? x.value : null, templateData: {}, template: x.persistent ? this.context.store.cms.templates.filter(y=>y.id===x.value)[0] : null})}/>
        </div>
        {this.props.isNew ? null : <div className="field">
          <a className="ui button" href="javascript:;" onClick={::this.saveTemplate}>Vorlage speichern</a>
        </div>}
      </form>
    );
  }
}
;

export default observer(ToolbarPage);
/*export default connect(state => ({
 templates: state.page.templates
 }))(ToolbarPage);*/
