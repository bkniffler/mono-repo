import React, {Component, PropTypes} from "react";
import Select from 'react-select';

import 'react-select/dist/react-select.css';
import './select2.less';

export default class Selector extends Component {
  static defaultProps = {
    valueKey: 'id',
    labelKey: 'name',
    fetch: null,
    options: [],
    addLabelText: 'Add "{label}"'
  };

  constructor() {
    super();
    this.updateValue = this.updateValue.bind(this);
    this.state = {};
  }

  componentDidMount() {
    const {fetch} = this.props;

    if (fetch && {}.toString.call(fetch) === '[object Function]') {
      fetch().then(result=> {
        this.setState({results: result});
      });
    }
  }

  updateValue(v) {
    const {updateValue, valueKey, multi, labelKey} = this.props;
    if (!v) {
      updateValue(null, null);
    }
    else if (multi) {
      updateValue(v.map(v=> {
        if (v['_' + labelKey]) {
          v[labelKey] = v['_' + labelKey];
          delete v['_' + labelKey];
        }
        return v
      }), Array.isArray(v) ? v.map(item=>item[valueKey]) : []);
    }
    else {
      if (v['_' + labelKey]) {
        v[labelKey] = v['_' + labelKey];
        delete v['_' + labelKey];
      }
      updateValue(v, v[valueKey]);
    }
  }

  filterOptions(options, filter, currentValues) {
    const {valueKey, labelKey, allowCreate, newOptionCreator, addLabelText} = this.props;
    let filteredOptions;
    if (!currentValues) currentValues = [];
    if (!options) options = [];

    options = options.filter(x=>currentValues.filter(y=>x[valueKey] === y[valueKey]).length === 0);
    if (allowCreate) {
      filteredOptions = [];

      if (filter && filter.length >= 1) { // If a filter is present
        options.forEach(option=> {
          if (typeof option[valueKey] === 'string') {
            if (option[valueKey].toLowerCase().indexOf(filter.toLowerCase()) > -1) {
              filteredOptions.push(option);
            }
          }
          else {
            if (option[valueKey] === filter) {
              filteredOptions.push(option);
            }
          }
        });
      }
      else { // Show everything available that's not already selected if no filter is used
        options.forEach(option=> {
          if (currentValues.map(x=>x[valueKey]).indexOf(option[valueKey]) === -1) {
            filteredOptions.push(option);
          }
        });
      }

      // Only display  `Add ${filter}` if no other options are available
      if (filteredOptions.length == 0 && filter) {
        var creator = function (x) {
          var v = newOptionCreator ? newOptionCreator(x) : {};
          if (typeof v !== 'object') {
            v = {[valueKey]: v};
          }
          if (labelKey === valueKey) {
            return {[valueKey]: x, ...v};
          }
          else {
            var tlabel = v[labelKey] || x;
            delete v[labelKey];
            return {[labelKey]: addLabelText.replace('{label}', x), [valueKey]: x, ...v, ['_' + labelKey]: tlabel};
          }
        };
        filteredOptions.push(creator(filter));
      }
    }

    return filteredOptions || options;
  }

  render() {
    const {options, loadOptions, placeholder, style, allowCreate} = this.props;
    const {results} = this.state;

    if (loadOptions) {
      return (
        <Select.Async
          style={style}
          {...this.props}
          options={null}
          searchable={true}
          placeholder={placeholder ||"Auswählen ..."}
          noResultsText="Keine Ergebnisse."
          onChange={this.updateValue}
          filterOptions={allowCreate ? this.filterOptions : undefined}
        />
      )
    }
    return (
      <Select
        style={style}
        {...this.props}
        searchable={true}
        placeholder={placeholder ||"Auswählen ..."}
        noResultsText="Keine Ergebnisse."
        options={results || options}
        onChange={this.updateValue}
        filterOptions={allowCreate ? this.filterOptions : undefined}
      />
    )
  }
}
