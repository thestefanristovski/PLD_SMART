import magenta.music as mm
from magenta.models.music_vae import configs
from magenta.models.music_vae.trained_model import TrainedModel

from algo.VAE.models.VAE import play, interpolate, download

import tensorflow.compat.v1 as tf

BASE_DIR = "gs://download.magenta.tensorflow.org/models/music_vae/colab2"

def generate(
    input_mel_midi_data = [
        tf.io.gfile.GFile(fn, 'rb').read()
        for fn in sorted(tf.io.gfile.glob(BASE_DIR + '/midi/mel_2bar*.mid'))]):
    
    #@title Load the pre-trained model.
    mel_2bar_config = configs.CONFIG_MAP['cat-mel_2bar_big']
    mel_2bar = TrainedModel(mel_2bar_config, batch_size=4, checkpoint_dir_or_path=BASE_DIR + '/checkpoints/mel_2bar_big.ckpt')
    #@title Option 1: Use example MIDI files for interpolation endpoints.
    input_mel_midi_data = [
        tf.io.gfile.GFile(fn, 'rb').read()
        for fn in sorted(tf.io.gfile.glob(BASE_DIR + '/midi/mel_2bar*.mid'))]

    #@title Extract melodies from MIDI files. This will extract all unique 2-bar melodies using a sliding window with a stride of 1 bar.
    mel_input_seqs = [mm.midi_to_sequence_proto(m) for m in input_mel_midi_data]
    extracted_mels = []
    for ns in mel_input_seqs:
        extracted_mels.extend(
            mel_2bar_config.data_converter.from_tensors(
                mel_2bar_config.data_converter.to_tensors(ns)[1]))
    for i, ns in enumerate(extracted_mels):
        print("Melody", i)
        play(ns)
        
    #@title Interpolate between 2 melodies, selected from those in the previous cell.
    start_melody = 0 #@param {type:"integer"}
    end_melody = 1 #@param {type:"integer"}
    start_mel = extracted_mels[start_melody]
    end_mel = extracted_mels[end_melody]

    temperature = 0.5 #@param {type:"slider", min:0.1, max:1.5, step:0.1}
    num_steps = 13 #@param {type:"integer"}

    mel_2bar_interp = interpolate(mel_2bar, start_mel, end_mel, num_steps=num_steps, temperature=temperature)
    
    #@title Optionally download interpolation MIDI file.
    download(mel_2bar_interp, 'mel_2bar_interp.mid')