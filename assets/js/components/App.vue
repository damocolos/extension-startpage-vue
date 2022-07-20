<template>
  <section>
    <div class="container">
      <a
        v-for="(item, index) of list"
        v-bind:key="'form-' + index"
        :href="item.url"
        :class="item.class"
        >{{ item.name }}
      </a>
    </div>

    <div class="popup-setting" v-if="showPopupSetting">
      <div class="popup-setting-content">
        <table>
          <tr>
            <th>Name</th>
            <th>URL</th>
            <th>Class</th>
            <th></th>
          </tr>
          <tr v-for="(item, index) of list" v-bind:key="'setting-' + index">
            <td><input type="text" v-model="item.name" name="name" /></td>
            <td><input type="text" v-model="item.url" name="url" /></td>
            <td><input type="text" v-model="item.class" name="class" /></td>
            <td>
              <button class="button" v-on:click="onRemove(item)">Remove</button>
            </td>
          </tr>
        </table>
        <div class="button-wrapper">
          <button class="button" v-on:click="onAdd">Add</button>
          <button class="button" v-on:click="onSave">Save</button>
        </div>

        <textarea v-model="importData" id="" cols="30" rows="10" />
        <div class="button-wrapper">
          <button class="button" v-on:click="onImport">Import</button>
        </div>
      </div>
    </div>

    <button class="setting-toggle button" v-on:click="togglePopup">
      {{ showPopupSetting ? 'Close' : 'Setting' }}
    </button>
  </section>
</template>

<script>
import { getSpaceStar, updateSpaceStar, addSpaceStar } from '../utils/api.js';

export default {
  name: 'App',
  data() {
    return {
      list: [],
      showPopupSetting: false,
      importData: '',
    };
  },
  async created() {
    chrome.storage.sync.get(['siteList'], (result) => {
      this.list = result.siteList;
      this.importData = JSON.stringify(result.siteList);
    });

    const stars = await getSpaceStar();
    if (stars && stars.length) {
      const data = stars.map((s) => s.data);
      this.list = data;
      this.importData = JSON.stringify(data);
      this.onSave();
    }
  },
  methods: {
    togglePopup() {
      this.showPopupSetting = !this.showPopupSetting;
    },
    async onAdd() {
      this.list.push({
        name: '',
        class: '',
        url: '',
      });
    },
    onRemove(item) {
      this.list = this.list.filter((i) => i !== item);
    },
    async onSave() {
      // for (const data of this.list) {
      //   await addSpaceStar({
      //     json: JSON.stringify({
      //       ...data,
      //       created_at: new Date().toISOString(),
      //     }),
      //   });
      // }
      chrome.storage.sync.set(
        {
          siteList: this.list,
        },
        () => {}
      );
    },
    onImport() {
      this.list = JSON.parse(this.importData);
      this.onSave();
    },
  },
};
</script>
