<template>
  <transition name="modal">
    <!-- modal mask -->
    <div class="modal__mask">
      <div class="modal__wrapper">
        <div class="modal__container">
          <div class="modal__header">
            <slot name="header">
              <!-- default modal header -->
            </slot>
          </div>

          <div class="modal__body">
            <slot name="body">
              <!-- default modal body -->
            </slot>
          </div>

          <div class="modal__footer">
            <slot name="footer">
              <!-- default modal footer -->
              <button class="modal__button" @click="$emit('close')">
                <slot name="close-text">
                  Close
                </slot>
              </button>
              <!-- default modal footer extra -->
              <slot name="footer-extra" />
              <!-- END default modal footer extra -->
              <!-- END default modal footer -->
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
