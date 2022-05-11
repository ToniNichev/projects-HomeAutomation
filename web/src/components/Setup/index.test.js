import React from 'react';
import { shallow, mount } from 'enzyme';
import  { Setup } from './';
import toJson from 'enzyme-to-json';




describe('Testing Header component', () => {
  it('renders as expected!', () => {
    const wrapper = mount(
      <Setup/>
    );
   expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('test notAvailableModalClose()', () => {

    const loadingValue = true;
    React.useState = jest.fn(initialLoadingValue => [
      loadingValue,
      () => {}
    ]);

    const wrapper = shallow(<Setup/>);
    
    console.log(wrapper.debug());
    
  });
})