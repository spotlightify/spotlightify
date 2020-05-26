from pynput import keyboard


def listener(open_ui):
    combinations = [
        {keyboard.Key.ctrl, keyboard.Key.space},
        {keyboard.Key.ctrl_l, keyboard.Key.space},
        {keyboard.Key.ctrl_r, keyboard.Key.space}
    ]

    pressed_keys = set()

    def get_vk(key):
        # gets virtual key allowing pressed keys to easily be compared
        return key.vk if hasattr(key, 'vk') else key.value.vk

    def is_combination_pressed(combination):
        return all([get_vk(key) in pressed_keys for key in combination])

    def on_press(key):
        try:
            pressed_keys.add(get_vk(key))
        except:
            print("Error occurred adding key from pressed_keys")

        for combination in combinations:  # Loop though each combination
            if is_combination_pressed(combination):
                open_ui.trigger()

    def on_release(key):
        try:
            pressed_keys.remove(get_vk(key))
        except:
            print("Error occurred removing key from pressed_keys")

    with keyboard.Listener(on_press=on_press, on_release=on_release) as listen:
        listen.join()
