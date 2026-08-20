    /* ---- per-guest personalization ----
       Each invite link carries a `?g=xxxx` token (lowercase alphanumeric,
       4 chars) identifying the guest. Add one entry per guest below; the
       token is the object key, so it doubles as the id you hand out and
       the lookup key here. Unknown/missing token -> falls back to the
       generic "دعوة لمن نحب" / 2-seat text already in the HTML, untouched.

       `name` is the full fragment that goes right after "دعوة", e.g.
       "للسيد عادل" renders as "دعوة للسيد عادل". */
    const GUESTS = {
      '00v8': { name: 'للسيد عادل القاسم', seats: 10 }, // guest 1
      '05g1': { name: '', seats: 2 }, // guest 2
      '0jpk': { name: '', seats: 2 }, // guest 3
      '0o2r': { name: '', seats: 2 }, // guest 4
      '0qf4': { name: '', seats: 2 }, // guest 5
      '0yby': { name: '', seats: 2 }, // guest 6
      '15by': { name: '', seats: 2 }, // guest 7
      '195j': { name: '', seats: 2 }, // guest 8
      '1eyy': { name: '', seats: 2 }, // guest 9
      '1ict': { name: '', seats: 2 }, // guest 10
      '1lr3': { name: '', seats: 2 }, // guest 11
      '1u32': { name: '', seats: 2 }, // guest 12
      '1zxo': { name: '', seats: 2 }, // guest 13
      '2bfs': { name: '', seats: 2 }, // guest 14
      '2esp': { name: '', seats: 2 }, // guest 15
      '2n64': { name: '', seats: 2 }, // guest 16
      '2p3y': { name: '', seats: 2 }, // guest 17
      '2qpr': { name: '', seats: 2 }, // guest 18
      '2t1t': { name: '', seats: 2 }, // guest 19
      '2vld': { name: '', seats: 2 }, // guest 20
      '30dn': { name: '', seats: 2 }, // guest 21
      '30my': { name: '', seats: 2 }, // guest 22
      '37q9': { name: '', seats: 2 }, // guest 23
      '38hy': { name: '', seats: 2 }, // guest 24
      '3ge8': { name: '', seats: 2 }, // guest 25
      '3jqi': { name: '', seats: 2 }, // guest 26
      '3ldq': { name: '', seats: 2 }, // guest 27
      '3uea': { name: '', seats: 2 }, // guest 28
      '431r': { name: '', seats: 2 }, // guest 29
      '4awt': { name: '', seats: 2 }, // guest 30
      '4om3': { name: '', seats: 2 }, // guest 31
      '4p40': { name: '', seats: 2 }, // guest 32
      '54nz': { name: '', seats: 2 }, // guest 33
      '5e8i': { name: '', seats: 2 }, // guest 34
      '5n8i': { name: '', seats: 2 }, // guest 35
      '5zpj': { name: '', seats: 2 }, // guest 36
      '6l6g': { name: '', seats: 2 }, // guest 37
      '6z8v': { name: '', seats: 2 }, // guest 38
      '75pr': { name: '', seats: 2 }, // guest 39
      '7sgm': { name: '', seats: 2 }, // guest 40
      '8dud': { name: '', seats: 2 }, // guest 41
      '8mtz': { name: '', seats: 2 }, // guest 42
      '8mx1': { name: '', seats: 2 }, // guest 43
      '8ojr': { name: '', seats: 2 }, // guest 44
      '919a': { name: '', seats: 2 }, // guest 45
      '92k4': { name: '', seats: 2 }, // guest 46
      '9a7m': { name: '', seats: 2 }, // guest 47
      '9p45': { name: '', seats: 2 }, // guest 48
      '9ph3': { name: '', seats: 2 }, // guest 49
      'a024': { name: '', seats: 2 }, // guest 50
      'ag1o': { name: '', seats: 2 }, // guest 51
      'ah8r': { name: '', seats: 2 }, // guest 52
      'ak1v': { name: '', seats: 2 }, // guest 53
      'as44': { name: '', seats: 2 }, // guest 54
      'atsn': { name: '', seats: 2 }, // guest 55
      'au5b': { name: '', seats: 2 }, // guest 56
      'b8dw': { name: '', seats: 2 }, // guest 57
      'b9m8': { name: '', seats: 2 }, // guest 58
      'bf1i': { name: '', seats: 2 }, // guest 59
      'bhql': { name: '', seats: 2 }, // guest 60
      'bmzv': { name: '', seats: 2 }, // guest 61
      'c1a7': { name: '', seats: 2 }, // guest 62
      'cp4e': { name: '', seats: 2 }, // guest 63
      'cx9j': { name: '', seats: 2 }, // guest 64
      'd467': { name: '', seats: 2 }, // guest 65
      'dgdz': { name: '', seats: 2 }, // guest 66
      'dgnn': { name: '', seats: 2 }, // guest 67
      'dhjk': { name: '', seats: 2 }, // guest 68
      'dkya': { name: '', seats: 2 }, // guest 69
      'docu': { name: '', seats: 2 }, // guest 70
      'dpff': { name: '', seats: 2 }, // guest 71
      'e6pr': { name: '', seats: 2 }, // guest 72
      'e6va': { name: '', seats: 2 }, // guest 73
      'evuh': { name: '', seats: 2 }, // guest 74
      'f07u': { name: '', seats: 2 }, // guest 75
      'f1cb': { name: '', seats: 2 }, // guest 76
      'f9sx': { name: '', seats: 2 }, // guest 77
      'fijo': { name: '', seats: 2 }, // guest 78
      'fno6': { name: '', seats: 2 }, // guest 79
      'fp05': { name: '', seats: 2 }, // guest 80
      'fpk0': { name: '', seats: 2 }, // guest 81
      'gbty': { name: '', seats: 2 }, // guest 82
      'gd8a': { name: '', seats: 2 }, // guest 83
      'gfyg': { name: '', seats: 2 }, // guest 84
      'gthc': { name: '', seats: 2 }, // guest 85
      'hbrp': { name: '', seats: 2 }, // guest 86
      'hej8': { name: '', seats: 2 }, // guest 87
      'hg9j': { name: '', seats: 2 }, // guest 88
      'hpoe': { name: '', seats: 2 }, // guest 89
      'hxtp': { name: '', seats: 2 }, // guest 90
      'hymq': { name: '', seats: 2 }, // guest 91
      'i379': { name: '', seats: 2 }, // guest 92
      'i49k': { name: '', seats: 2 }, // guest 93
      'i65f': { name: '', seats: 2 }, // guest 94
      'i8bz': { name: '', seats: 2 }, // guest 95
      'im0y': { name: '', seats: 2 }, // guest 96
      'iqk2': { name: '', seats: 2 }, // guest 97
      'jedk': { name: '', seats: 2 }, // guest 98
      'jjtf': { name: '', seats: 2 }, // guest 99
      'k3aq': { name: '', seats: 2 }, // guest 100
      'kd6f': { name: '', seats: 2 }, // guest 101
      'kfs6': { name: '', seats: 2 }, // guest 102
      'kgyc': { name: '', seats: 2 }, // guest 103
      'khkt': { name: '', seats: 2 }, // guest 104
      'kxwn': { name: '', seats: 2 }, // guest 105
      'l0bl': { name: '', seats: 2 }, // guest 106
      'l5nw': { name: '', seats: 2 }, // guest 107
      'l73d': { name: '', seats: 2 }, // guest 108
      'l7r8': { name: '', seats: 2 }, // guest 109
      'l9ek': { name: '', seats: 2 }, // guest 110
      'leep': { name: '', seats: 2 }, // guest 111
      'ltz9': { name: '', seats: 2 }, // guest 112
      'm82i': { name: '', seats: 2 }, // guest 113
      'meco': { name: '', seats: 2 }, // guest 114
      'mgg1': { name: '', seats: 2 }, // guest 115
      'mn4r': { name: '', seats: 2 }, // guest 116
      'msnd': { name: '', seats: 2 }, // guest 117
      'n3qx': { name: '', seats: 2 }, // guest 118
      'n6qi': { name: '', seats: 2 }, // guest 119
      'nq65': { name: '', seats: 2 }, // guest 120
      'o5or': { name: '', seats: 2 }, // guest 121
      'o7y2': { name: '', seats: 2 }, // guest 122
      'oaed': { name: '', seats: 2 }, // guest 123
      'oecb': { name: '', seats: 2 }, // guest 124
      'oecv': { name: '', seats: 2 }, // guest 125
      'oig8': { name: '', seats: 2 }, // guest 126
      'omjb': { name: '', seats: 2 }, // guest 127
      'ozpt': { name: '', seats: 2 }, // guest 128
      'p98q': { name: '', seats: 2 }, // guest 129
      'pe29': { name: '', seats: 2 }, // guest 130
      'pgw9': { name: '', seats: 2 }, // guest 131
      'ph90': { name: '', seats: 2 }, // guest 132
      'pi4h': { name: '', seats: 2 }, // guest 133
      'pk3y': { name: '', seats: 2 }, // guest 134
      'pmbj': { name: '', seats: 2 }, // guest 135
      'q4he': { name: '', seats: 2 }, // guest 136
      'q71n': { name: '', seats: 2 }, // guest 137
      'qcg1': { name: '', seats: 2 }, // guest 138
      'qdf1': { name: '', seats: 2 }, // guest 139
      'qfkp': { name: '', seats: 2 }, // guest 140
      'qm1h': { name: '', seats: 2 }, // guest 141
      'qnup': { name: '', seats: 2 }, // guest 142
      'qohm': { name: '', seats: 2 }, // guest 143
      'qvrr': { name: '', seats: 2 }, // guest 144
      'qzit': { name: '', seats: 2 }, // guest 145
      'r9ou': { name: '', seats: 2 }, // guest 146
      'rcav': { name: '', seats: 2 }, // guest 147
      'rcd9': { name: '', seats: 2 }, // guest 148
      'rek8': { name: '', seats: 2 }, // guest 149
      'rerw': { name: '', seats: 2 }, // guest 150
      'rjnv': { name: '', seats: 2 }, // guest 151
      'rsnv': { name: '', seats: 2 }, // guest 152
      'rvu8': { name: '', seats: 2 }, // guest 153
      's3eo': { name: '', seats: 2 }, // guest 154
      'scos': { name: '', seats: 2 }, // guest 155
      'sfog': { name: '', seats: 2 }, // guest 156
      'si5g': { name: '', seats: 2 }, // guest 157
      'sk28': { name: '', seats: 2 }, // guest 158
      'soxl': { name: '', seats: 2 }, // guest 159
      't6mj': { name: '', seats: 2 }, // guest 160
      't6t0': { name: '', seats: 2 }, // guest 161
      't7a9': { name: '', seats: 2 }, // guest 162
      'ta8i': { name: '', seats: 2 }, // guest 163
      'tgiq': { name: '', seats: 2 }, // guest 164
      'ts2h': { name: '', seats: 2 }, // guest 165
      'u261': { name: '', seats: 2 }, // guest 166
      'uh8l': { name: '', seats: 2 }, // guest 167
      'un5z': { name: '', seats: 2 }, // guest 168
      'upfr': { name: '', seats: 2 }, // guest 169
      'uvyr': { name: '', seats: 2 }, // guest 170
      'uzs9': { name: '', seats: 2 }, // guest 171
      'v0pr': { name: '', seats: 2 }, // guest 172
      'vb5u': { name: '', seats: 2 }, // guest 173
      'vb9o': { name: '', seats: 2 }, // guest 174
      'vfpt': { name: '', seats: 2 }, // guest 175
      'vgpm': { name: '', seats: 2 }, // guest 176
      'vhs1': { name: '', seats: 2 }, // guest 177
      'vzk3': { name: '', seats: 2 }, // guest 178
      'w103': { name: '', seats: 2 }, // guest 179
      'w19v': { name: '', seats: 2 }, // guest 180
      'w3rt': { name: '', seats: 2 }, // guest 181
      'w81x': { name: '', seats: 2 }, // guest 182
      'wepx': { name: '', seats: 2 }, // guest 183
      'wtoo': { name: '', seats: 2 }, // guest 184
      'wu16': { name: '', seats: 2 }, // guest 185
      'wwqc': { name: '', seats: 2 }, // guest 186
      'x272': { name: '', seats: 2 }, // guest 187
      'x3j1': { name: '', seats: 2 }, // guest 188
      'x497': { name: '', seats: 2 }, // guest 189
      'xcwn': { name: '', seats: 2 }, // guest 190
      'xk87': { name: '', seats: 2 }, // guest 191
      'y088': { name: '', seats: 2 }, // guest 192
      'yjne': { name: '', seats: 2 }, // guest 193
      'yq3s': { name: '', seats: 2 }, // guest 194
      'yr3x': { name: '', seats: 2 }, // guest 195
      'yun3': { name: '', seats: 2 }, // guest 196
      'z5ed': { name: '', seats: 2 }, // guest 197
      'zhpc': { name: '', seats: 2 }, // guest 198
      'zmep': { name: '', seats: 2 }, // guest 199
      'zren': { name: '', seats: 2 }, // guest 200
    };

    (function personalizeForGuest(){
      const token = (new URLSearchParams(location.search).get('g') || '').toLowerCase();
      const guest = GUESTS[token];
      if (!guest) return;

      const kicker = document.getElementById('kickerText');
      if (kicker) kicker.textContent = 'دعوة ' + guest.name;

      const seatCount = document.getElementById('seatCount');
      if (seatCount && Number.isFinite(guest.seats)) {
        const easternDigits = '٠١٢٣٤٥٦٧٨٩';
        seatCount.textContent = String(guest.seats).replace(/[0-9]/g, d => easternDigits[d]);
      }
    })();
