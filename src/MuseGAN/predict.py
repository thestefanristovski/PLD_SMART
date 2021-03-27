import os
import matplotlib.pyplot as plt
import numpy as np
import types

from models.MuseGAN import MuseGAN
from utils.loaders import load_music

from music21 import midi
from music21 import note, stream, duration

from tensorflow.keras.models import load_model

import base64
from mailjet_rest import Client

# run params
SECTION = 'compose'
RUN_ID = '001'
DATA_NAME = 'chorales'
FILENAME = 'Jsb16thSeparated.npz'
RUN_FOLDER = 'run/{}/'.format(SECTION)
RUN_FOLDER += '_'.join([RUN_ID, DATA_NAME])

BATCH_SIZE = 64
n_bars = 2
n_steps_per_bar = 16
n_pitches = 84
n_tracks = 4

data_binary, data_ints, raw_data = load_music(DATA_NAME, FILENAME, n_bars, n_steps_per_bar)
# data_binary = np.squeeze(data_binary)

gan = MuseGAN(input_dim = data_binary.shape[1:]
        , critic_learning_rate = 0.001
        , generator_learning_rate = 0.001
        , optimiser = 'adam'
        , grad_weight = 10
        , z_dim = 32
        , batch_size = BATCH_SIZE
        , n_tracks = n_tracks
        , n_bars = n_bars
        , n_steps_per_bar = n_steps_per_bar
        , n_pitches = n_pitches
        )

gan.load_weights(RUN_FOLDER, None)

gan.generator.summary()

gan.critic.summary()

chords_noise = np.random.normal(0, 1, (1, gan.z_dim))
style_noise = np.random.normal(0, 1, (1, gan.z_dim))
melody_noise = np.random.normal(0, 1, (1, gan.n_tracks, gan.z_dim))
groove_noise = np.random.normal(0, 1, (1, gan.n_tracks, gan.z_dim))

gen_scores = gan.generator.predict([chords_noise, style_noise, melody_noise, groove_noise])

np.argmax(gen_scores[0,0,0:4,:,3], axis = 1)

gen_scores[0,0,0:4,60,3] = 0.02347812

filename = 'example'
gan.notes_to_midi(RUN_FOLDER, gen_scores, filename)

# email MIDI
data = open("run/compose/001_chorales/samples/example.midi", "rb").read()
base64_encoded = base64.b64encode(data).decode('UTF-8')
api_key = '38817c8762daa6ece62ed835cf6ae535'
api_secret = '47dcb611df77418c32cefc614c09e266'
mailjet = Client(auth=(api_key, api_secret), version='v3.1')
data = {
'Messages': [
    {
    "From": {
        "Email": "thanawat.waterdb@gmail.com",
        "Name": "Alex"
    },
    "To": [{"Email": "bremard.alexandre@gmail.com",
            "Name": "Alexandre"}],
    "Subject": "MIDI files generated by MuseGAN",
    "TextPart": "MIDI files generated by MuseGAN",
    "Attachments": [
        {
            "ContentType": "audio/midi",
            "Filename": "example.midi",
            "Base64Content": base64_encoded
        }
    ],
    "CustomID": "AppPredictionData"
    }
]
}
# result = mailjet.send.create(data=data)
# print(result)

gan.draw_score(gen_scores, 0)

def find_closest(data_binary, score):
    current_dist = 99999999
    current_i = -1
    for i, d in enumerate(data_binary):
        dist = np.sqrt(np.sum(pow((d - score),2)))
        if dist < current_dist:
            current_i = i
            current_dist = dist
        
    return current_i

closest_idx = find_closest(data_binary, gen_scores[0])
closest_data = data_binary[[closest_idx]]
print(closest_idx)

filename = 'closest'
gan.notes_to_midi(RUN_FOLDER, closest_data,filename)

data = open("run/compose/001_chorales/samples/closest.midi", "rb").read()
base64_encoded = base64.b64encode(data).decode('UTF-8')
api_key = '38817c8762daa6ece62ed835cf6ae535'
api_secret = '47dcb611df77418c32cefc614c09e266'
mailjet = Client(auth=(api_key, api_secret), version='v3.1')
data = {
'Messages': [
    {
    "From": {
        "Email": "thanawat.waterdb@gmail.com",
        "Name": "Alex"
    },
    "To": [{"Email": "bremard.alexandre@gmail.com",
            "Name": "Alexandre"}],
    "Subject": "MIDI files generated by MuseGAN",
    "TextPart": "MIDI files generated by MuseGAN",
    "Attachments": [
        {
            "ContentType": "audio/midi",
            "Filename": "closest.midi",
            "Base64Content": base64_encoded
        }
    ],
    "CustomID": "AppPredictionData"
    }
]
}
# result = mailjet.send.create(data=data)
# print(result)

chords_noise_2 = 5 * np.ones((1, gan.z_dim))

chords_scores = gan.generator.predict([chords_noise_2, style_noise, melody_noise, groove_noise])

filename = 'changing_chords'
gan.notes_to_midi(RUN_FOLDER, chords_scores, filename)
# chords_score = converter.parse(os.path.join(RUN_FOLDER, 'samples/{}.midi'.format(filename)))
# print('original')
# gen_score.show()
# print('chords noise changed')
# chords_score.show()

style_noise_2 = 5 * np.ones((1, gan.z_dim))

style_scores = gan.generator.predict([chords_noise, style_noise_2, melody_noise, groove_noise])

filename = 'changing_style'
gan.notes_to_midi(RUN_FOLDER, style_scores, filename)
# style_score = converter.parse(os.path.join(RUN_FOLDER, 'samples/{}.midi'.format(filename)))
# print('original')
# gen_score.show()
# print('style noise changed')
# style_score.show()

melody_noise_2 = np.copy(melody_noise)
melody_noise_2[0,0,:] = 5 * np.ones(gan.z_dim) 

melody_scores = gan.generator.predict([chords_noise, style_noise, melody_noise_2, groove_noise])

filename = 'changing_melody'
gan.notes_to_midi(RUN_FOLDER, melody_scores, filename)
# melody_score = converter.parse(os.path.join(RUN_FOLDER, 'samples/{}.midi'.format(filename)))
# print('original')
# gen_score.show()
# print('melody noise changed')
# melody_score.show()

groove_noise_2 = np.copy(groove_noise)
groove_noise_2[0,3,:] = 5 * np.ones(gan.z_dim)

groove_scores = gan.generator.predict([chords_noise, style_noise, melody_noise, groove_noise_2])

filename = 'changing_groove'
gan.notes_to_midi(RUN_FOLDER, groove_scores, filename)
# groove_score = converter.parse(os.path.join(RUN_FOLDER, 'samples/{}.midi'.format(filename)))
# print('original')
# gen_score.show()
# print('groove noise changed')
# groove_score.show()