import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/css/index.styl';
import TreeTable from 'vue-table-with-tree-grid';
import VueQuillEditor from 'vue-quill-editor';
// import 'quill/dist/quill.core.css';
// import 'quill/dist/quill.snow.css';
// import 'quill/dist/quill.bubble.css';
import Nprogress from 'nprogress';
// import 'nprogress/nprogress.css';
// element ui 改用 cdn
// import {
//   Pagination,
//   Dialog,
//   Autocomplete,
//   Dropdown,
//   DropdownMenu,
//   DropdownItem,
//   Menu,
//   Submenu,
//   MenuItem,
//   MenuItemGroup,
//   Input,
//   InputNumber,
//   Radio,
//   RadioGroup,
//   RadioButton,
//   Checkbox,
//   CheckboxButton,
//   CheckboxGroup,
//   Switch,
//   Select,
//   Option,
//   OptionGroup,
//   Button,
//   ButtonGroup,
//   Table,
//   TableColumn,
//   DatePicker,
//   TimeSelect,
//   TimePicker,
//   Popover,
//   Tooltip,
//   Breadcrumb,
//   BreadcrumbItem,
//   Form,
//   FormItem,
//   Tabs,
//   TabPane,
//   Tag,
//   Tree,
//   Alert,
//   Slider,
//   Icon,
//   Row,
//   Col,
//   Upload,
//   Progress,
//   Spinner,
//   Badge,
//   Card,
//   Rate,
//   Steps,
//   Step,
//   Carousel,
//   CarouselItem,
//   Collapse,
//   CollapseItem,
//   Cascader,
//   ColorPicker,
//   Transfer,
//   Container,
//   Header,
//   Aside,
//   Main,
//   Footer,
//   Timeline,
//   TimelineItem,
//   Link,
//   Divider,
//   Image,
//   Calendar,
//   Backtop,
//   PageHeader,
//   CascaderPanel,
//   Loading,
//   MessageBox,
//   Message,
//   Notification
// } from 'element-ui';

import axios from 'axios';
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';

axios.interceptors.request.use(config => {
  Nprogress.start();
  let token = window.sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

axios.interceptors.response.use(response => {
  Nprogress.done();
  const { data: res } = response;
  if (res.meta.msg === '无效token') {
    router.push('/login');
  }
  return res;
});

Vue.prototype.$http = axios;

// Vue.use(Pagination);
// Vue.use(Dialog);
// Vue.use(Autocomplete);
// Vue.use(Dropdown);
// Vue.use(DropdownMenu);
// Vue.use(DropdownItem);
// Vue.use(Menu);
// Vue.use(Submenu);
// Vue.use(MenuItem);
// Vue.use(MenuItemGroup);
// Vue.use(Input);
// Vue.use(InputNumber);
// Vue.use(Radio);
// Vue.use(RadioGroup);
// Vue.use(RadioButton);
// Vue.use(Checkbox);
// Vue.use(CheckboxButton);
// Vue.use(CheckboxGroup);
// Vue.use(Switch);
// Vue.use(Select);
// Vue.use(Option);
// Vue.use(OptionGroup);
// Vue.use(Button);
// Vue.use(ButtonGroup);
// Vue.use(Table);
// Vue.use(TableColumn);
// Vue.use(DatePicker);
// Vue.use(TimeSelect);
// Vue.use(TimePicker);
// Vue.use(Popover);
// Vue.use(Tooltip);
// Vue.use(Breadcrumb);
// Vue.use(BreadcrumbItem);
// Vue.use(Form);
// Vue.use(FormItem);
// Vue.use(Tabs);
// Vue.use(TabPane);
// Vue.use(Tag);
// Vue.use(Tree);
// Vue.use(Alert);
// Vue.use(Slider);
// Vue.use(Icon);
// Vue.use(Row);
// Vue.use(Col);
// Vue.use(Upload);
// Vue.use(Progress);
// Vue.use(Spinner);
// Vue.use(Badge);
// Vue.use(Card);
// Vue.use(Rate);
// Vue.use(Steps);
// Vue.use(Step);
// Vue.use(Carousel);
// Vue.use(CarouselItem);
// Vue.use(Collapse);
// Vue.use(CollapseItem);
// Vue.use(Cascader);
// Vue.use(ColorPicker);
// Vue.use(Transfer);
// Vue.use(Container);
// Vue.use(Header);
// Vue.use(Aside);
// Vue.use(Main);
// Vue.use(Footer);
// Vue.use(Timeline);
// Vue.use(TimelineItem);
// Vue.use(Link);
// Vue.use(Divider);
// Vue.use(Image);
// Vue.use(Calendar);
// Vue.use(Backtop);
// Vue.use(PageHeader);
// Vue.use(CascaderPanel);

// Vue.use(Loading.directive);
// 富文本编辑器
Vue.use(VueQuillEditor);

Vue.component('tree-table', TreeTable);

// Vue.prototype.$loading = Loading.service;
// Vue.prototype.$msgbox = MessageBox;
// Vue.prototype.$alert = MessageBox.alert;
// Vue.prototype.$confirm = MessageBox.confirm;
// Vue.prototype.$prompt = MessageBox.prompt;
// Vue.prototype.$notify = Notification;
// Vue.prototype.$message = Message;

// 全局过滤器
Vue.filter('dateFormat', originVal => {
  const date = new Date(originVal);
  const y = date.getFullYear();
  const m = (date.getMonth() + 1 + '').padStart(2, '0');
  const d = (date.getDate() + '').padStart(2, '0');

  const hh = (date.getHours() + '').padStart(2, '0');
  // 小于10补0,两种写法
  // const mm = ('0' + (date.getMonth + 1)).slice(-2);
  const mm = (date.getMinutes() + '').padStart(2, '0');
  const ss = (date.getSeconds() + '').padStart(2, '0');

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
