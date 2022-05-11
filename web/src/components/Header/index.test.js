import React from 'react';
import { shallow } from 'enzyme';
import Header from './';
import toJson from 'enzyme-to-json';

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    search: '?test=123'
  })
}));


describe('Testing Header component', () => {
    it('renders as expected!!!', () => {

      const myMock = jest.fn();

      const a = new myMock({one: 111});
      
      console.log(myMock.mock.instances);

      const wrapper = shallow(
        <Header title="Title test" />
      );

    expect(myMock.mock.calls.length).toBe(1);
     //expect(toJson(wrapper)).toMatchSnapshot();
   });
});