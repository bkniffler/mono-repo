import {BlockWrapper} from 'draft-wysiwyg';

export default options => WrappedComponent => {
  const component = BlockWrapper(options)(WrappedComponent);

  component.title = WrappedComponent.title;
  component.category = WrappedComponent.category;
  component.icon = WrappedComponent.icon;

  return component;
}
