<template>
  <ValidationObserver slim>
    <TextInput
      v-if="inputProp.type === 'text'"
      :input-prop="inputProp"
      @onChange="onChange"
    />
    <FileInput
      v-if="inputProp.type === 'file'"
      :input-prop="inputProp"
      :placeholder="inputProp.placeholder"
      :id-key="firstKey + secondKey"
      @onChange="onChange"
    />
    <!-- サイズ -->
    <b-input-group
      v-if="inputProp.type === 'pixel'"
      prepend="px"
      :class="$style.pixelInputGroup"
    >
      <b-form-input
        v-model="size"
        placeholder="20"
        type="number"
        min="0"
        @input.native="onChange($event.target.value, 'value')"
      ></b-form-input>
    </b-input-group>
    <ColorInput
      v-if="inputProp.type === 'colorBoldSize' || inputProp.type === 'color'"
      :input-prop="inputProp"
      @onChange="onChange"
    />
    <!-- カスタムフォーム -->
    <b-form-textarea
      v-if="inputProp.type === 'customForm'"
      v-model="text"
      :placeholder="inputProp.placeholder"
      rows="6"
      @input.native="onChange($event.target.value, 'value')"
    ></b-form-textarea>
  </ValidationObserver>
</template>

<script lang="ts">
import { Vue, Prop, Watch } from 'vue-property-decorator'
import Component from 'vue-class-component'
import { Getter, namespace } from 'vuex-class'
import { ValidationProvider, ValidationObserver } from 'vee-validate'
import TextInput from './Text.vue'
import FileInput from './File.vue'
import ColorInput from './Color.vue'
import {
  ITextInput,
  IFileInput,
  IPixelInput,
  IColorInput,
  IColorBoldSizeInputs,
  ICustomFormInput
} from '@/types/Custom/inputs'
import { IItemList } from '@/types/Custom/items/itemList'
import { IPropertyNamesAndValue } from '@/store/types'

const ItemModule = namespace('ItemState')

@Component({
  components: {
    ValidationProvider,
    ValidationObserver,
    TextInput,
    FileInput,
    ColorInput
  }
})
export default class Input extends Vue {
  @ItemModule.Getter('getItemState')
  private getItemState!: IItemList

  @Prop({ default: () => {} })
  inputProp!:
    | ITextInput
    | IFileInput
    | IPixelInput
    | IColorInput
    | IColorBoldSizeInputs

  @Prop({ default: '' })
  firstKey!: string

  @Prop({ default: '' })
  secondKey!: string

  @Prop({ default: '' })
  thirdKey!: string

  @Prop({ default: '' })
  fourthKey!: string

  public size: string = ''
  public text: string = ''

  get storeItemState() {
    return this.getItemState
  }

  @Watch('storeItemState')
  onChangeItemState() {
    if (this.inputProp.type === 'pixel') {
      const inputProp = this.inputProp as IPixelInput
      this.size = inputProp.value
    } else if (this.inputProp.type === 'customForm') {
      const inputProp = this.inputProp as ICustomFormInput
      this.text = inputProp.value
    }
  }

  mounted() {
    this.onChangeItemState()
  }

  onChange(value: any, propertyName: string) {
    const prop: IPropertyNamesAndValue = {
      value,
      keys: {
        first: this.firstKey,
        second: this.secondKey,
        third: this.thirdKey,
        fourth: this.fourthKey,
        propertyName
      }
    }
    this.$emit('onChange', prop)
  }
}
</script>

<style module lang="scss">
.pixelInputGroup {
  min-width: 90px;
  max-width: 105px;
}
</style>
