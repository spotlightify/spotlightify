from pynput import keyboard
from src.ui import show_ui


def listener():
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
        pressed_keys.add(get_vk(key))

        for combination in combinations:  # Loop though each combination
            if is_combination_pressed(combination):
                show_ui()


    def on_release(key):
        pressed_keys.remove(get_vk(key))

    with keyboard.Listener(on_press=on_press, on_release=on_release) as listen:
        listen.join()
