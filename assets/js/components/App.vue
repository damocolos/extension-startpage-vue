<template>
  <section>
    <draggable v-model="shortcuts" class="draggable">
      <transition-group tag="div" class="container">
        <div
          class="shortcut-wrapper"
          v-for="(item, index) of shortcuts"
          v-bind:key="'form-' + index"
        >
          <a :href="item.url" :class="item.class">{{ item.name }}</a>
          <div class="button-wrapper" v-if="editMode">
            <div>
              <vs-button
                class="update-button"
                size="small"
                radius
                @click="openModal(item)"
                color="success"
                type="filled"
                ><vs-icon icon="edit"></vs-icon
              ></vs-button>
              <vs-button
                class="delete-button"
                size="small"
                radius
                @click="confirmDelete(item.id)"
                color="danger"
                type="filled"
                ><vs-icon icon="delete"></vs-icon
              ></vs-button>
            </div>
          </div>
        </div>
      </transition-group>
    </draggable>

    <div class="fly-button">
      <live-attendance v-if="features.LIVE_ATTENDANCE" class="mr-3" />
      <vs-switch color="success" v-model="editMode" />
      <vs-button
        class="add-button"
        @click="openModal()"
        color="primary"
        type="filled"
        ><vs-icon icon="add"></vs-icon
      ></vs-button>
    </div>

    <vs-prompt
      title="Shortcut"
      color="primary"
      accept-text="Save"
      @accept="onSaveShortcut"
      :active.sync="isModalOpen"
    >
      <div class="centerx labelx">
        <vs-input label="Name" size="large" v-model="form.name" />
        <vs-input
          class="top-space"
          label="Class"
          size="large"
          v-model="form.class"
        />
        <vs-textarea class="top-space" label="Url" v-model="form.url" />
      </div>
    </vs-prompt>
  </section>
</template>

<script>
import { db } from '../db.js';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  setDoc,
  doc,
  query,
  orderBy,
  getDoc,
} from 'firebase/firestore/lite';
import draggable from 'vuedraggable';
import { features } from '../features.js';
import LiveAttendance from './LiveAttendance.vue';

export default {
  name: 'App',
  components: {
    LiveAttendance,
    draggable,
  },
  data() {
    return {
      shortcuts: [],
      shortcutOrder: '',
      isModalOpen: false,
      activePrompt2: false,
      form: {
        id: '',
        name: '',
        url: '',
        class: '',
      },
      editMode: false,
      features: features,
    };
  },
  async created() {
    chrome.storage.sync.get(['shortcuts', 'shortcutOrder'], (result) => {
      this.shortcutOrder = result.shortcutOrder;
      this.shortcuts = result.shortcuts;
    });

    this.onInit();
  },
  methods: {
    async onInit() {
      const [shortcutsResponse, shortCutOrderResponse] = await Promise.all([
        this.getShortcuts(),
        this.getShortcutOrder(),
      ]);

      const shortcutsOrdered = this.getShortcutByOrder(
        shortcutsResponse,
        shortCutOrderResponse
      );

      this.onSaveLocalStorage(shortcutsOrdered, shortCutOrderResponse);

      this.shortcuts = shortcutsOrdered;
      this.shortcutOrder = shortCutOrderResponse;
    },
    openModal(data = null) {
      if (data) {
        this.form = data;
      } else {
        this.form = {
          id: '',
          name: '',
          url: '',
          class: '',
        };
      }
      this.isModalOpen = true;
    },
    async onSaveLocalStorage(shortcuts, shortcutOrder) {
      if (shortcuts.length) {
        chrome.storage.sync.set(
          {
            shortcuts,
            shortcutOrder,
          },
          () => {}
        );
      }
    },
    async onSaveShortcut() {
      const { id, ...data } = this.form;
      try {
        if (id == '') {
          const doc = await addDoc(collection(db, 'shortcuts'), data);
          this.updateShortcutOrderWithValue(doc.id);
        } else {
          await setDoc(doc(db, 'shortcuts', id), data);
        }
        await this.onInit();
        this.$vs.notify({
          title: 'Shortcut saved',
          text: `${data.name} saved`,
          color: 'success',
          position: 'top-right',
        });
      } catch (err) {
        this.$vs.notify({
          title: 'Shortcut error',
          text: `${data.name} error`,
          color: 'error',
          position: 'top-right',
        });
      }
    },
    async getShortcuts() {
      try {
        const q = query(collection(db, 'shortcuts'), orderBy('class', 'asc'));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.docs.length) {
          const shortcutList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          return shortcutList;
        }
      } catch (err) {
        console.log(err);
      }
      return [];
    },
    async getShortcutOrder() {
      const docRef = doc(db, 'shortcut-order', 'order');

      try {
        const doc = await getDoc(docRef);
        return doc.data().list;
      } catch (e) {
        console.log('Error getting shorcut order:', e);
      }
      return '';
    },
    async updateShortcutOrder() {
      if (!this.shortcuts.length) {
        return;
      }

      try {
        let orderString = this.shortcuts.map((item) => item.id).join(',');
        if (this.shortcutOrder == orderString) {
          return;
        }
        await setDoc(doc(db, 'shortcut-order', 'order'), {
          list: orderString,
        });
        this.shortcutOrder = orderString;
        this.$vs.notify({
          title: 'synced',
          color: 'success',
          position: 'top-center',
        });
      } catch (e) {
        console.log('Error update shortcut order:', e);
      }
    },
    async updateShortcutOrderWithValue(newId) {
      try {
        const orderString = this.shortcutOrder + ',' + newId;
        await setDoc(doc(db, 'shortcut-order', 'order'), {
          list: orderString,
        });
        this.shortcutOrder = orderString;
        this.$vs.notify({
          title: 'sync',
          color: 'dark',
          position: 'top-right',
        });
      } catch (e) {
        console.log('Error update shortcut order:', e);
      }
    },
    confirmDelete(id) {
      this.$vs.dialog({
        color: 'danger',
        title: `Confirm Delete`,
        text: 'Are you sure?',
        accept: () => this.deleteShortcut(id),
      });
    },
    async deleteShortcut(id) {
      try {
        await deleteDoc(doc(db, 'shortcuts', id));
        this.onInit();
        this.$vs.notify({
          title: 'Shortcut deleted',
          text: `deleted`,
          color: 'success',
          position: 'top-right',
        });
      } catch (err) {
        this.$vs.notify({
          title: 'Shortcut error',
          text: `error`,
          color: 'error',
          position: 'top-right',
        });
        console.log(err);
      }
    },
    getShortcutByOrder(shortcuts, shortcutOrder) {
      if (!shortcuts) return [];

      if (shortcutOrder === '') return shortcuts;

      const order = shortcutOrder.split(',');
      const shortcutList = [];

      for (const id of order) {
        const shortcut = shortcuts.find((item) => item.id === id);
        if (shortcut) shortcutList.push(shortcut);
      }

      return shortcutList;
    },
  },
};
</script>
